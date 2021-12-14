import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { add, addSeconds } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';

import { StorageService } from '../storage/storage.service';
import {
  AppEndpointKey,
  AppEndpoints,
  AppEndpointsData,
  AppEndpointsResponse,
  UniHttpAdapter,
} from '../../interfaces';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { ConfigAction, CsaaAuthAction, ServiceLocatorAction } from '../../store/actions';
import { trackRequest } from '../../operators/track-request.operator';
import { PlatformService } from '../platform.service';
import { AngularHttpAdapter } from '../http/adapters/angular-http.adapter';
import { IonicHttpAdapter } from '../http/adapters/ionic-http.adapter';
import { ConfigState } from '../../store/states/config.state';
import { ConfigSelector } from '../../store/selectors';
import { forceReportError, reportError } from '../../../_core/helpers';
import { App } from '@capacitor/app';
const app = require('../../../assets/config/app-info');

@Injectable({
  providedIn: CsaaCommonModule,
})
export class BootstrapService {
  private static endpointSuffixMap: { [k in AppEndpointKey]?: string } = {
    policyDocuments: '/:policyNumber/:docType',
    policyDocumentByType: '/:policyNumber/:productType/:docType',
    contentLegal: '/:contentName/wy',
  };

  private client: UniHttpAdapter;

  constructor(
    private readonly storageService: StorageService,
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly platformService: PlatformService,
    httpClient: HttpClient,
    ionicHttp: HTTP
  ) {
    // TODO: we could inject those if we imported the CsaaHttpClientModule in the CommonModule
    this.client = this.platformService.isBrowser()
      ? new AngularHttpAdapter(httpClient)
      : new IonicHttpAdapter(ionicHttp);
    this.actions$
      .pipe(ofActionDispatched(ServiceLocatorAction.LoadAppEndpoints))
      .subscribe((action: ServiceLocatorAction.LoadAppEndpoints) => {
        const { isBrowser, serviceLocatorUrl } = action;
        return this.fetchServiceEndpoints(isBrowser, serviceLocatorUrl)
          .pipe(trackRequest(ServiceLocatorAction.LoadAppEndpoints))
          .subscribe({
            next: (data) => {
              this.store.dispatch(new ConfigAction.SetAppEndpoints(data));
            },
            error: (e) => {
              this.store.dispatch(new ConfigAction.SetAppEndpoints(null, e));
              reportError(e);
            },
          });
      });

    this.platformService.ready().then(() => {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          this.store.dispatch(new CsaaAuthAction.CheckTokenExpired());
        }
      });
    });
  }

  /**
   * Map server params syntax to path-to-regex friendly syntax
   * Example: /api/v1/{policyNumber}/{policyType} --> /api/v1/:policyNumber/:policyType
   *
   * @param endpoint
   * @private
   * @return string
   */
  private static normalizeSubstitutionString(endpoint: string): string {
    return endpoint.replace(/{(\w+)}/g, ':$1');
  }

  private static applySuffix(
    urlWithoutSuffix: string,
    key: AppEndpointKey,
    suffixToRemove?: string
  ): string {
    let base = urlWithoutSuffix;

    // If the urlWithoutSuffix is one that belongs to another endpoint,
    // then we may want to remove the suffix if it was applied prior to this step
    if (suffixToRemove) {
      base = urlWithoutSuffix.replace(new RegExp(`${suffixToRemove}$`), '');
    }

    return base + (BootstrapService.endpointSuffixMap[key] || '');
  }

  private static patchEndpoints(data: AppEndpointsData): AppEndpointsData {
    if (!data) {
      throw new Error('[CSAA:Error] Endpoints data is unavailable!');
    }
    const { endpoints, ...rest } = data;
    // We'll patch in named resources that doesn't come out of the box
    return {
      ...rest,
      endpoints: {
        ...endpoints,
        policyDocumentByType: BootstrapService.applySuffix(
          endpoints.policyDocuments,
          'policyDocumentByType',
          BootstrapService.endpointSuffixMap.policyDocuments
        ),
        paperlessEnrollmentAccepted: BootstrapService.normalizeSubstitutionString(
          endpoints.paperlessEnrollmentAccepted || ''
        ),
        paperlessPreferences: BootstrapService.normalizeSubstitutionString(
          endpoints.paperlessPreferences || ''
        ),
      },
    };
  }

  private static normalizeAppEndpoints({ endpoints }: AppEndpointsResponse): {
    appEndpoints: AppEndpoints;
    publicEndpointKeys: AppEndpointKey[];
  } {
    const publicEndpointKeys: AppEndpointKey[] = [];
    const appEndpoints = Object.keys(endpoints).reduce((acc, cur: AppEndpointKey) => {
      if (endpoints[cur]?.isPublic) {
        publicEndpointKeys.push(cur);
      }
      try {
        const formatted = BootstrapService.applySuffix(endpoints[cur].url, cur);
        acc[cur] = BootstrapService.normalizeSubstitutionString(formatted);
      } catch (error) {
        // We don't want to interrupt the loop, but report silently
        console.error(`CSAA: config set [${cur}] endpoint failed`, { error });
      }
      return acc;
    }, {} as AppEndpoints);
    return { appEndpoints, publicEndpointKeys };
  }

  private fetchServiceEndpoints(
    isBrowser: boolean,
    serviceLocatorUrl: string
  ): Observable<AppEndpointsData> {
    return this.client
      .get<AppEndpointsResponse>(isBrowser ? this.getServiceLocatorProxyUrl() : serviceLocatorUrl, {
        headers: {
          'x-api-key': this.store.selectSnapshot(ConfigSelector.state)?.activeConfigData?.apiKey,
        },
      })
      .pipe(
        map((r) => {
          const cacheControl = r.headers.get('cache-control');
          const m = cacheControl && cacheControl.match(/max-age=(\d+)/);
          const maxAge = m && m[1] ? Number(m[1]) : undefined;

          return {
            data: r.body,
            expireAt: maxAge ? addSeconds(new Date(), maxAge) : undefined,
          };
        }),
        map(({ data, expireAt }) => {
          const { appEndpoints, publicEndpointKeys } = BootstrapService.normalizeAppEndpoints(data);
          return {
            expireAt,
            endpoints: appEndpoints,
            publicEndpointKeys,
          };
        }),
        tap((data) => this.persistEndpointsData(data, app.version, data.expireAt)),
        catchError((e) => {
          // Report whenever service locator request fails
          try {
            const url = isBrowser ? this.getServiceLocatorProxyUrl() : serviceLocatorUrl;
            console.log(
              `CSAA: Unable to fetch service locator endpoints from ${url} due to ${e}...`
            );
            forceReportError(e);
          } catch {
            // ignore
          }
          return this.loadPersistedEndpointsData();
        }),
        map(BootstrapService.patchEndpoints)
      );
  }

  private getServiceLocatorProxyUrl(): string {
    return (
      'SERVICE_LOCATOR_' + this.store.selectSnapshot(ConfigState.activeConfig).env.toUpperCase()
    );
  }

  private loadPersistedEndpointsData(): Observable<AppEndpointsData | null> {
    return from(this.storageService.get(StorageService.KEY.SERVICE_LOCATORS)).pipe(
      catchError(() => of(null)),
      switchMap((content) => {
        if (!content) {
          return of(null);
        }
        try {
          const { data, expireAt, appVersion } = content as {
            data: AppEndpointsData;
            expireAt: string;
            appVersion: string;
          };
          if (!expireAt || app.version !== appVersion) {
            console.log('CSAA: Reloading Service Locator endpoints...');
            return from(this.storageService.remove(StorageService.KEY.SERVICE_LOCATORS)).pipe(
              map(() => null)
            );
          }
          if (data.expireAt) {
            data.expireAt = new Date(data.expireAt);
          }
          return of(data);
        } catch (exc) {
          console.error('Error when loading persisted endpoints data:', exc.toString());
          throw exc;
        }
      })
    );
  }

  private persistEndpointsData(
    data: AppEndpointsData,
    appVersion: string,
    exp?: Date
  ): Observable<any> {
    // If we don't get exp date, we handle gracefully by setting 24 hours
    const expireAt = exp || add(new Date(), { days: 1 });
    return from(
      this.storageService.set(
        StorageService.KEY.SERVICE_LOCATORS,
        JSON.stringify({
          data,
          appVersion,
          expireAt: expireAt.toISOString(),
        })
      )
    );
  }
}
