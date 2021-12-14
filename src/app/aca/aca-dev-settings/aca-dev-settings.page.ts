import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  ConfigAction,
  ServiceLocatorAction,
} from 'src/app/micro-apps/csaa-mobile/_core/store/actions';
import { ConfigService } from '../../micro-apps/csaa-mobile';
import { onceTruthy } from '../../micro-apps/csaa-mobile/_core/operators';
import { RouterService } from '../../micro-apps/csaa-mobile/_core/services';
import { FetchState } from '../../micro-apps/csaa-mobile/_core/store/states/fetch.state';

@Component({
  selector: 'csaa-aca-dev-settings',
  templateUrl: './aca-dev-settings.page.html',
  styleUrls: ['./aca-dev-settings.page.scss'],
})
export class AcaDevSettingsPage implements OnInit {
  public env = 'Loading..';
  public theme = 'Loading..';
  public codeVersion = 'Loading..';

  @Select(FetchState.isLoading(ServiceLocatorAction.LoadAppEndpoints))
  isLoading$: Observable<boolean>;

  constructor(
    private readonly configService: ConfigService,
    private readonly alertController: AlertController,
    private readonly routerService: RouterService,
    private readonly store: Store
  ) {}

  ngOnInit() {
    this.configService.ready().subscribe((config) => {
      const { env, theme, codeVersion } = config.activeConfigData;
      this.env = env;
      this.theme = theme;
      this.codeVersion = codeVersion;
    });
  }

  reloadServiceLocator() {
    this.store.dispatch(new ConfigAction.LoadAppEndpoints(true)).subscribe(() => {
      this.isLoading$
        .pipe(onceTruthy((loading) => !loading))
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
