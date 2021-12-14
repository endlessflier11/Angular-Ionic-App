import { ErrorHandler, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';

export class RefreshTokenExpiredError extends Error {
  constructor(...params) {
    super(...params);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, RefreshTokenExpiredError.prototype);
  }
}
export class UnknownRefreshError extends Error {
  constructor(...params) {
    super(...params);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UnknownRefreshError.prototype);
  }
}

@Injectable({
  providedIn: CsaaCoreModule,
})
export class CustomErrorHandler implements ErrorHandler {
  constructor(
    private alertCtrl: AlertController // TODO v5: keep?  private signOut: SignOutDirective
  ) {}

  handleError(error: any) {
    const httpErrorCode = error.httpErrorCode;
    console.error(error);
    switch (httpErrorCode) {
      // todo: ... do we care to give a different message for each error?
      default:
        this.showError(error);
    }
  }

  async getAlertForError(error) {
    if (error instanceof RefreshTokenExpiredError) {
      return await this.alertCtrl.create({
        header: `Login expired`,
        subHeader: `Please sign up again.`,
        buttons: [
          {
            text: 'Okay',
            role: 'cancel',
            handler: () => 
              // TODO v5: keep?
              // this.signOut.signOut();
               true
            ,
          },
        ],
      });
    }

    if (error instanceof UnknownRefreshError) {
      return this.alertCtrl.create({
        header: 'Something went wrong',
        subHeader: `We're sorry, there was an issue. Tap Dismiss then pull-down to refresh screen or try again later.`,
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ],
      });
    }
    if (error.status && error.body && error.body.error) {
      return this.alertCtrl.create({
        header: `${error.status} error`,
        subHeader: error.body.error,
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ],
      });
    }
    return this.alertCtrl.create({
      header: 'An error occurred',
      subHeader: 'Retry or contact support',
      message: error.message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
  }

  private async showError(error) {
    const alert = await this.getAlertForError(error);
    await alert.present();
  }
}
