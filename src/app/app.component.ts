import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { ConfigService, CsaaConfigEnv, CsaaTheme } from '@csaadigital/mobile-mypolicy';
import { environment } from 'src/environments/environment';
import { AuthService } from './_core/services';
import { NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ClubConfigHelper } from './_core/helpers/club-config.helper';
import { Store } from '@ngxs/store';
import { ConfigState } from './micro-apps/csaa-mobile/_core/store/states/config.state';
import { PlatformService } from './micro-apps/csaa-mobile/_core/services/platform.service';
import { ACA_UNINSURED_REDIRECT_URL } from './micro-apps/csaa-mobile/constants';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public currentHostTheme = '';

  constructor(
    private platform: Platform,
    private configService: ConfigService,
    private standaloneAuthService: AuthService,
    private readonly router: Router,
    private store: Store,
    private platformService: PlatformService
  ) {
    this.autoSetupFromRoute();
    this.initializeApp();
  }

  initializeApp() {
    this.platform
      .ready()
      .then(async () => {
        if (!this.platformService.isNative()) {
          return;
        }

        await StatusBar.setStyle({ style: Style.Dark });
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.show();
        }
        return Promise.resolve();
      })
      .then(async () => {
        this.standaloneAuthService.initStandaloneAuthCheck().subscribe();
        this.store.select(ConfigState.theme).subscribe((theme) => {
          console.log('Global Theme changed', { theme });
          this.currentHostTheme = 'global-' + theme;
        });
        await SplashScreen.hide();
      });
  }

  /**
   * For development, call config setup based on the club in the route
   */
  private autoSetupFromRoute() {
    this.router.events
      .pipe(
        filter(() => !this.store.selectSnapshot(ConfigState.configLoaded)),
        filter((event) => event instanceof NavigationStart && event.url.startsWith('/mobile/')),
        map((event: NavigationStart) => event.url.split('/')[2])
      )
      .subscribe((club) => {
        // For development trigger auth check earlier so we can bypass auth guard for deep routes
        this.standaloneAuthService.initStandaloneAuthCheck().subscribe();
        console.log('CSAA: !! Initializing CSAA module based on route for development :', club);
        const theme = ClubConfigHelper.clubToEnum(club);
        const { clubPath, moduleRootPath } = ClubConfigHelper.getPaths(theme);
        const isACA = CsaaTheme.ACA === theme;
        this.configService.setup(
          environment.production ? CsaaConfigEnv.PROD : CsaaConfigEnv.QA,
          theme,
          {
            moduleRootPath,
            nonInsuredRedirectTo: isACA ? null : '/auth',
            showHomeHeader: isACA,
            homeBackButtonRedirectTo: clubPath,
            handleIgToken: isACA,
            clubCode: isACA ? '212' : '005',
            zipCode: isACA ? '73120' : null,
            nonInsuredRedirectToExternal: isACA ? ACA_UNINSURED_REDIRECT_URL : undefined,
          }
        );
      });
  }
}
