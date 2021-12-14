import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MetadataService } from '../metadata.service';
import {
  AppEndpointKey,
  AppEndpointsEnum,
  UniHttpAdapterTarget,
  UniHttpNamedResourceOptions,
  UniHttpOptions,
} from '../../interfaces';
import { compile } from 'path-to-regexp';
import { Store } from '@ngxs/store';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { onceTruthy } from '../../operators';
import { ConfigStateModel } from '../../store/states/state.interfaces';
import { map } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { AuthSelector, ConfigSelector } from '../../store/selectors';
import { UniHttpClient, UniHttpResponse, UNI_HTTP_ADAPTER } from './uni-http.model';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class HttpService {
  private get publicApiEndpointsList(): AppEndpointKey[] {
    return this.store.selectSnapshot(ConfigSelector.state).appEndpoints.publicEndpointKeys || [];
  }

  private currentAdapterTarget: UniHttpAdapterTarget;

  constructor(
    private store: Store,
    private metadataService: MetadataService,
    private platform: Platform,
    @Inject(UNI_HTTP_ADAPTER) private adapters: UniHttpClient[]
  ) {
    this.platform.ready().then(() =>
      this.store
        .select(ConfigSelector.state)
        .pipe(
          map((state: ConfigStateModel) => state?.configLoaded),
          onceTruthy()
        )
        .subscribe(() => {
          this.currentAdapterTarget = this.store.selectSnapshot(ConfigSelector.state).isNative
            ? UniHttpAdapterTarget.NATIVE
            : UniHttpAdapterTarget.BROWSER;
        })
    );
  }

  public get client(): UniHttpClient {
    if (this.currentAdapterTarget === undefined) {
      throw new Error(
        `UniHttpClient current adapter target is "undefined". Is Platform not ready?`
      );
    }
    const adapter = this.adapters.find((a) => a.target === this.currentAdapterTarget);
    if (!adapter) {
      throw new Error(
        `UniHttpClient adapter that targets "${
          UniHttpAdapterTarget[this.currentAdapterTarget]
        }" not registered`
      );
    }
    return adapter;
  }

  static compileUrlWithParams(url: string, routeParams: { [k: string]: string }): string {
    const routeParamsEncoded = Object.keys(routeParams || {}).reduce((acc, cur) => {
      acc[cur] = encodeURIComponent(routeParams[cur]);
      return acc;
    }, {});
    const urlWithPortPattern = /([\w.-]+?|[0-9]{1,3}(\.[0-9]{1,3}){3}):\d{2,}/;
    let prefix = '';
    let path = url;

    if (url.startsWith('http')) {
      const parts = url.match(/^(https?:\/\/)(.+)/);
      const [, scheme, urlWithoutScheme] = parts;
      prefix = scheme;
      path = urlWithoutScheme;
    }

    // If url contains port number for example: https://localhost:9000/:foo,
    // then in addition to moving the scheme (https://), we also move the url and port to the variable `prefix`.
    // That way, we only parse the path (/:foo) without complications.
    // Now given the url above, we get output which is a combination of 'https://localhost:9000' + '/bar'
    if (urlWithPortPattern.test(path)) {
      const [urlWithPort] = path.match(urlWithPortPattern);
      prefix += urlWithPort;
      path = path.replace(new RegExp(`^${urlWithPort}`), '');
    }

    const compiled = compile(path)(routeParamsEncoded || undefined);
    // Decode and strip double slashes in final url
    return prefix + decodeURIComponent(`${compiled}`).replace(/\/{2,}/g, '/');
  }

  // TODO: make private when all endpoints use service locator
  public get<T = any>(url: string, options: UniHttpOptions = {}): Observable<UniHttpResponse<T>> {
    const {
      igAccessToken: { accessToken },
    } = this.store.selectSnapshot(AuthSelector.state);
    return this.client.get<T>(url, {
      ...options,
      ...this.generateHttpOptions(url, accessToken, options.namedEndpointKey, 'write'),
    });
  }

  public getNamedResource<T = any>(
    url: AppEndpointsEnum,
    options: UniHttpNamedResourceOptions = {}
  ): Observable<UniHttpResponse<T>> {
    return this.get<T>(this.getCompiledUrl(url, options), { ...options, namedEndpointKey: url });
  }

  // TODO: make private when all endpoints use service locator
  public post<T = any>(
    url: string,
    data: { [key: string]: any },
    options: UniHttpOptions = {}
  ): Observable<UniHttpResponse<T>> {
    const {
      igAccessToken: { accessToken },
    } = this.store.selectSnapshot(AuthSelector.state);
    return this.client.post<T>(url, data, {
      ...options,
      ...this.generateHttpOptions(url, accessToken, options.namedEndpointKey, 'write'),
    });
  }

  public postNamedResource<T = any>(
    url: AppEndpointsEnum,
    data: { [key: string]: any },
    options: UniHttpNamedResourceOptions = {}
  ): Observable<UniHttpResponse<T>> {
    return this.post<T>(this.getCompiledUrl(url, options), data, {
      ...options,
      namedEndpointKey: url,
    });
  }

  private generateHttpOptions(
    url: string,
    token: string,
    namedEndpointKey?: AppEndpointsEnum,
    transationType: 'read' | 'write' = 'read'
  ): UniHttpOptions | undefined {
    // Prefer [namedEndpointKey] to comparing [url === AppEndpoint].
    // sometimes, urls mismatch due to route params present in AppEndpoints route
    if (
      url && // this is useless but let's make linter happy for now
      token &&
      namedEndpointKey !== undefined &&
      !this.publicApiEndpointsList.includes(AppEndpointsEnum[namedEndpointKey] as AppEndpointKey)
    ) {
      const apiKey = this.store.selectSnapshot(ConfigSelector.state)?.activeConfigData?.apiKey;
      return {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-ApplicationContext': JSON.stringify(
            this.metadataService.getApplicationContextMetadata(transationType)
          ),
          'x-api-key': apiKey,
        },
      };
    }
    return undefined;
  }

  public getCompiledUrl(url: AppEndpointsEnum, options: UniHttpNamedResourceOptions = {}) {
    const {
      appEndpoints: { endpoints },
    } = this.store.selectSnapshot(ConfigSelector.state);

    return HttpService.compileUrlWithParams(endpoints[AppEndpointsEnum[url]], options.routeParams);
  }
}
