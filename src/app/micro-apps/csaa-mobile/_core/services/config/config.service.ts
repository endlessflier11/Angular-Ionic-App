import { Injectable, Injector } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Device } from '@capacitor/device';

import {
  CsaaConfig,
  CsaaConfigData,
  CsaaConfigEnv,
  CsaaTheme,
  FetchStatus,
} from '../../interfaces';
import { ConfigAction, MetadataAction } from '../../store/actions';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { onceTruthy } from '../../operators/conditional.operator';
import { BootstrapService } from '../bootstrap/bootstrap.service';
import { ConfigStateModel } from '../../store/states/state.interfaces';
import { PlatformService } from '../platform.service';
import { ConfigSelector } from '../../store/selectors';
import { CookieJar } from '@aaa-mobile/capacitor-plugin';

const configAndEndpointsLoaded = (state) =>
  state?.configLoaded && state?.endpointsLoadState === FetchStatus.SUCCESS;

// Let's keep these 3 exports as long as :- Parent app imports these declarations from this file directly?
export { CsaaConfig, CsaaConfigEnv, CsaaTheme };

@Injectable({
  providedIn: CsaaCommonModule,
})
export class ConfigService {
  constructor(
    private readonly store: Store,
    private readonly injector: Injector,
    private readonly platformService: PlatformService
  ) {}

  /**
   * This is the first method HostApp calls in our module
   * and a way be in sync with HostApp bootstrap process.
   */
  public setup(
    env: CsaaConfigEnv,
    theme: CsaaTheme,
    data: CsaaConfigData & { [key: string]: any }
  ): Observable<boolean> {
    const resultObservable = this.ngxsReady().pipe(
      switchMap(() => {
        console.log('CSAA: Setup', { theme, env, data });
        // It is safe to get device.uuid here
        const deviceUuid = this.platformService.isNative()
          ? from(
              Device.getId()
                .then((deviceId) => deviceId.uuid)
                .catch(() => '127.0.0.1')
            )
          : of('127.0.0.1');
        const clubCode = data.clubCode || '005';
        this.injector.get(BootstrapService);
        deviceUuid
          .pipe(
            switchMap((uuid) =>
              this.store.dispatch([
                new ConfigAction.Setup(env, theme, data, this.platformService.isNative()),
                new ConfigAction.SetActiveConfig(env),
                new MetadataAction.SetConstants(uuid, clubCode),
                new ConfigAction.LoadAppEndpoints(),
              ])
            )
          )
          .subscribe();

        return this.store.select(ConfigSelector.state);
      }),
      map(configAndEndpointsLoaded)
    );

    resultObservable.subscribe();

    return resultObservable;
  }

  public ready(): Observable<ConfigStateModel> {
    return this.store.select(ConfigSelector.state).pipe(
      map(configAndEndpointsLoaded),
      onceTruthy(),
      map((_) => this.store.selectSnapshot(ConfigSelector.state))
    );
  }

  public setWebviewCookies(cookies: CookieJar[]) {
    this.store.dispatch(new ConfigAction.SetWebviewCookies(cookies || []));
  }

  public getTheme() {
    return this.store.selectSnapshot(ConfigSelector.state)?.preferredTheme;
  }

  private ngxsReady() {
    return this.store.select(ConfigSelector.storeInitialized).pipe(onceTruthy());
  }
}
