import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { noop, Observable, of } from 'rxjs';
import { AlertController, NavController } from '@ionic/angular';

import { AuthService } from '../../_core/services';
import { RouterHelpers } from '../../micro-apps/csaa-mobile/_core/helpers';
import { Router } from '@angular/router';
import { ConfigService, RouterService } from '../../micro-apps/csaa-mobile/_core/services';
import { onceTruthy } from '../../micro-apps/csaa-mobile/_core/operators';
import { Store, Select } from '@ngxs/store';
import {
  ConfigAction,
  ServiceLocatorAction,
} from 'src/app/micro-apps/csaa-mobile/_core/store/actions';
import { FetchState } from '../../micro-apps/csaa-mobile/_core/store/states/fetch.state';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tab-placeholder',
  templateUrl: './tab-placeholder.page.html',
  styleUrls: ['./tab-placeholder.page.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TabPlaceholderPage implements OnInit {
  public readonly route = RouterHelpers.getRoutePath;
  public isAuthenticated: boolean;
  public env = 'Loading..';
  public theme = 'Loading..';
  public codeVersion = 'Loading..';
  @Select(FetchState.isLoading(ServiceLocatorAction.LoadAppEndpoints))
  isLoading$: Observable<boolean>;

  public get title(): string {
    const currentPath = this.router.url;
    switch (true) {
      case currentPath === '/mobile/mwg/tab1':
        return 'Home';
      case currentPath === '/mobile/mwg/tab3':
        return 'Tab 3';
      default:
        return 'Tab Title';
    }
  }

  public get showDevMenu(): boolean {
    const currentPath = this.router.url;
    return currentPath === '/mobile/mwg/tab3';
  }

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly navController: NavController,
    private readonly configService: ConfigService,
    private readonly alertController: AlertController,
    private readonly routerService: RouterService,
    private readonly store: Store
  ) {
    this.authService.authStatus().subscribe((status) => {
      this.isAuthenticated = status;
    });
  }

  ngOnInit() {
    this.configService.ready().subscribe((config) => {
      const { env, theme, codeVersion } = config.activeConfigData;
      this.env = env;
      this.theme = theme;
      this.codeVersion = codeVersion;
    });
  }

  logout() {
    this.authService.logout().subscribe(
      () => {
        this.authService.ready().subscribe(() => {
          if (!this.authService.isAuthenticated) {
            this.navController.navigateForward(this.route('csaa.parent.app')).then(noop);
          }
        });
      },
      (error) => {
        console.log('CSAA: ', { error });
        return of(error);
      }
    );
  }

  reloadServiceLocator() {
    this.store.dispatch(new ConfigAction.LoadAppEndpoints(true)).subscribe(() => {
      this.isLoading$
        .pipe(
          map((loading) => !loading),
          onceTruthy()
        )
        .subscribe(async () => {
          const success = this.store.selectSnapshot(
            FetchState.succeeded(ServiceLocatorAction.LoadAppEndpoints)
          );
          if (success) {
            const alert = await this.alertController.create({
              header: 'Service Locator',
              message:
                'Success! Removed endpoints in local storage and reloaded data from Service Locator.',
              buttons: [
                {
                  text: 'Ok',
                  role: 'cancel',
                },
              ],
            });
            alert.present();
          } else {
            const alert = await this.alertController.create({
              header: 'Service Locator',
              message: 'Failed to reload service locator.',
              buttons: [
                {
                  text: 'Ok',
                  role: 'cancel',
                },
                {
                  text: 'Retry',
                  handler: () => this.reloadServiceLocator(),
                },
              ],
            });
            alert.present();
          }
        });
    });
  }
  goBackClubSelection() {
    this.routerService.navigateAway('/');
  }
}
