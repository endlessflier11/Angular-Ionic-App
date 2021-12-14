import { Injectable } from '@angular/core';
import { Launch, WebViewResponse, WebViewStyle } from '@aaa-mobile/capacitor-plugin';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../store/states/config.state';
import { CONNECTION_ERRORS } from '../../../constants';
import { ModalController } from '@ionic/angular';
import { RouterService } from '../router/router.service';
import { NationalCustomAlertModalComponent } from '../../ui-kits/national-custom-alert/national-custom-alert-modal';
import { CookieJar } from '@aaa-mobile/capacitor-plugin';

export class WebViewError extends Error implements WebViewResponse {
  public reason: string;
  public data: string;
  public statusCode: string;

  constructor({ reason, data, statusCode, message }) {
    super(message);
    Object.setPrototypeOf(this, WebViewError.prototype);
    this.reason = reason;
    this.data = data;
    this.statusCode = statusCode;
  }
}

@Injectable({
  providedIn: CsaaCommonModule,
})
export class WebviewService {
  constructor(
    private readonly store: Store,
    private modalController: ModalController,
    private routerService: RouterService
  ) {}

  open(
    url: string,
    redirectOnFailToPath: string = null,
    handleError = true,
    cookies: CookieJar[] = []
  ) {
    const { webview } = this.store.selectSnapshot(ConfigState.themeColors);
    const { zipCode, clubCode, webviewCookies } = this.store.selectSnapshot(ConfigState);
    const zipCodeCookie = {
      domain: '.aaa.com',
      name: 'zipcode',
      value: `${zipCode}|AAA|${clubCode}|SP`,
      permanent: 'true',
    };
    const allCookies = [
      zipCodeCookie,
      ...(Array.isArray(webviewCookies) ? webviewCookies : []),
      ...(Array.isArray(cookies) ? cookies : []),
    ];
    const link = {
      url,
      navbarColor: webview,
      options: {
        cookies: allCookies,
      },
    };
    return this.launchWebView(link, redirectOnFailToPath, handleError);
  }

  openWithCookies(url: string, cookies: CookieJar[] = []) {
    return this.open(url, null, true, cookies);
  }

  private launchWebView(link, redirectOnFailToPath, handleError: boolean) {
    return Launch.webView({
      link,
      style: WebViewStyle.STANDARD,
    })
      .then((result) => {
        if (result.reason === 'Error') {
          return Promise.reject(new WebViewError(result));
        }
        return Promise.resolve(result);
      })
      .catch(async (error) => {
        if (!handleError && !redirectOnFailToPath) {
          throw error;
        }
        const statusCode = error.statusCode ?? 'Unknown Error';
        if (CONNECTION_ERRORS.includes(statusCode)) {
          await this.showConnectionErrorsModal();
        } else {
          await this.showErrorModal();
        }
        if (!!redirectOnFailToPath) {
          return this.routerService.navigateAway(redirectOnFailToPath);
        }
      });
  }

  private async showConnectionErrorsModal() {
    const modal = await this.modalController.create({
      component: NationalCustomAlertModalComponent,
      componentProps: {
        headerText: 'Network not available',
        messageText: ``,
        phoneMessage: `Please check your internet connection and/or signal strength and try again.<br/><br/>For Roadside Assistance call `,
        buttonText: 'OK',
        showLoginOption: false,
      },
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      keyboardClose: true,
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  private async showErrorModal() {
    const modal = await this.modalController.create({
      component: NationalCustomAlertModalComponent,
      componentProps: {
        headerText: 'Unable to open Web Page',
        messageText: `We were unable to load the requested Web Page at this time. Please check your connection and try again.`,
        phoneMessage: null,
        buttonText: 'OK',
        showLoginOption: false,
      },
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      keyboardClose: true,
    });
    await modal.present();
    await modal.onDidDismiss();
  }
}
