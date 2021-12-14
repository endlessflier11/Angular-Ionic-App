import { Injectable } from '@angular/core';
import { map, mergeMap, switchMap, timeoutWith } from 'rxjs/operators';
import { forkJoin, Observable, throwError } from 'rxjs';

import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import {
  AppEndpointsEnum,
  FetchStatus,
  WebDeeplinkInitializationPayload,
  WebDeeplinkInitializationResponse,
  WebDeeplinkLocation,
} from '../../interfaces';
import { HttpService } from '../http/http.service';
import { Store } from '@ngxs/store';
import { CsaaTokensManaged } from '..';
import { PlatformService } from '../platform.service';
import { onceTruthy } from '../../operators';
import { AuthSelector, ConfigSelector } from '../../store/selectors';
import { HTTP_TRANSLATOR_SERVICE_TIMEOUT } from '../../../constants';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class SsoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly store: Store,
    private readonly platformService: PlatformService
  ) {}

  public generateWebDeeplink(location: WebDeeplinkLocation | string): Observable<string> {
    return this.generateSecureLink('deep-link', location);
  }

  public generateWalletPasslink(location: WebDeeplinkLocation | string): Observable<string> {
    return this.generateSecureLink('wallet', location);
  }

  private generateSecureLink(
    linkType: 'deep-link' | 'wallet',
    location: WebDeeplinkLocation | string
  ): Observable<string> {
    return forkJoin([this.configReady(), this.store.selectOnce(AuthSelector.state)]).pipe(
      mergeMap(
        ([
          {
            appEndpoints: { endpoints },
          },
          {
            igAccessToken: { accessToken, idToken },
          },
        ]) => {
          const payload: WebDeeplinkInitializationPayload = {
            pageURI: location,
            accessToken,
            idToken: idToken || '',
          };

          // CORS: Proxy if on browser
          const source = this.platformService.isBrowser()
            ? this.httpService.post<WebDeeplinkInitializationResponse>(
                '/translator/tempToken',
                payload
              )
            : this.httpService.postNamedResource<WebDeeplinkInitializationResponse>(
                AppEndpointsEnum.mobileTranslatorServiceTempToken,
                payload
              );

          const targetUrl =
            linkType === 'deep-link'
              ? endpoints.mobileTranslatorServiceDeepLink
              : endpoints.mobileTranslatorServiceWalletPass;
          return source.pipe(
            map(({ body }) => body),
            map((data) => `${targetUrl}/${data.tempToken}/${location}`)
          );
        }
      )
    );
  }

  /**
   * Method called by CsaaAuthState to handle CsaaAuthAction.RequestIgAccessToken
   */
  public callTranslatorService(aaaOauthResponse: CsaaTokensManaged) {
    const {
      activeConfigData: { codeVersion, env, theme, apiKey },
      clubCode,
    } = this.store.selectSnapshot(ConfigSelector.state);
    const versionInfo = {
      mmpVersion: codeVersion,
      aaaEnv: env,
      theme,
      clubCode,
    };

    let payload: any = {
      clubCode,
      accessToken: aaaOauthResponse.accessToken,
      state: aaaOauthResponse.state,
      versionInfo,
    };
    if (!!aaaOauthResponse.custKey) {
      payload = { custKey: aaaOauthResponse.custKey, email: aaaOauthResponse.email, versionInfo };
    }
    return this.configReady().pipe(
      switchMap(() => {
        if (this.platformService.isBrowser()) {
          // uses proxy.conf.json:
          return this.httpService
            .post('/translator/processMobileOAuth', payload, { headers: { 'x-api-key': apiKey } })
            .pipe(map(({ body }) => body));
        } else {
          // uses service a locator based request:
          return this.httpService
            .postNamedResource(AppEndpointsEnum.mobileTranslatorService, payload, {
              headers: { 'x-api-key': apiKey },
            })
            .pipe(
              timeoutWith(
                HTTP_TRANSLATOR_SERVICE_TIMEOUT,
                throwError(
                  new HttpErrorResponse({
                    url: this.httpService.getCompiledUrl(AppEndpointsEnum.mobileTranslatorService),
                    status: 504,
                    statusText:
                      'CSAA: Call to Mobile Translator Service timed out after' +
                      ` ${HTTP_TRANSLATOR_SERVICE_TIMEOUT}ms. ${JSON.stringify(
                        payload.versionInfo
                      )}`,
                  })
                )
              ),
              map(({ body }) => body)
            );
        }
      })
    );
  }

  private configReady() {
    return this.store.select(ConfigSelector.state).pipe(
      map((state) => state?.configLoaded && state?.endpointsLoadState === FetchStatus.SUCCESS),
      onceTruthy(),
      map((_) => this.store.selectSnapshot(ConfigSelector.state))
    );
  }
}
