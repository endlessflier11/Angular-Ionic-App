import { Injectable } from '@angular/core';
import { map, mergeMap, switchMap, timeoutWith } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ConfigService, HttpService } from 'src/app/micro-apps/csaa-mobile/_core/services';
import {
  AppEndpointsEnum,
  MwgSsoAuthResponse,
} from 'src/app/micro-apps/csaa-mobile/_core/interfaces';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../../micro-apps/csaa-mobile/_core/store/states/config.state';
import { PlatformService } from 'src/app/micro-apps/csaa-mobile/_core/services/platform.service';
import { HTTP_TRANSLATOR_SERVICE_TIMEOUT } from '../../../micro-apps/csaa-mobile/constants';
import { ConfigSelector } from '../../../micro-apps/csaa-mobile/_core/store/selectors';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SsoService {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly store: Store,
    private readonly platformService: PlatformService
  ) {}

  /**
   * For managed IG Access Token access with SSO bypass
   */
  private loginIgManagedBypass(email: string) {
    const data = {
      custKey: 'qa-sso-bypass',
      email,
      accessToken: null,
    };
    return this.authService.igManagedSignIn(email, data);
  }

  loginViaSsoBypass(email: string) {
    if (this.store.selectSnapshot(ConfigState).handleIgToken) {
      return this.loginIgManagedBypass(email);
    }
    return this.callTranslatorServiceSSOByPass(email).pipe(
      mergeMap((authRes: MwgSsoAuthResponse) => {
        const { accessToken, expiresIn } = authRes;
        return this.authService.ssoSignIn(accessToken, '', expiresIn.toString());
      })
    );
  }

  private callTranslatorServiceSSOByPass(email: string) {
    const payload = {
      email,
      custKey: 'qa-sso-bypass',
    };
    return this.callTranslatorCommon(payload);
  }

  private callTranslatorCommon(payload: { [key: string]: any }) {
    const {
      activeConfigData: { codeVersion, env, theme },
      clubCode,
    } = this.store.selectSnapshot(ConfigSelector.state);
    payload.versionInfo = {
      mmpVersion: codeVersion,
      aaaEnv: env,
      theme,
      clubCode,
    };

    return this.configService.ready().pipe(
      switchMap(() => {
        if (this.platformService.isBrowser()) {
          // uses proxy.conf.json:
          return this.httpService
            .post('/translator/processMobileOAuth', payload)
            .pipe(map(({ body }) => body));
        } else {
          // uses service a locator based request:
          return this.httpService
            .postNamedResource(AppEndpointsEnum.mobileTranslatorService, payload)
            .pipe(
              timeoutWith(
                HTTP_TRANSLATOR_SERVICE_TIMEOUT,
                throwError(
                  new HttpErrorResponse({
                    url: this.httpService.getCompiledUrl(AppEndpointsEnum.mobileTranslatorService),
                    status: 504,
                    statusText:
                      'CSAA: Call to Mobile Translator Service timed out' +
                      ` after ${HTTP_TRANSLATOR_SERVICE_TIMEOUT}ms. ${JSON.stringify(
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
}
