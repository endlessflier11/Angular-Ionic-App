import { Directive, HostListener, Input } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { PaymentAccount } from '../../../../_core/interfaces';
import { CsaaAppInjector } from '../../../../csaa-app.injector';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[csaaDeleteConfirm]',
})
export class DeleteConfirmDirective {
  @Input() deleteConfirmTarget: PaymentAccount;
  @Input() csaaDeleteConfirm: () => void;

  constructor(private readonly alertController: AlertController) {}

  @HostListener('click', ['$event'])
  onClick(ev) {
    ev.preventDefault();
    this.confirmPaymentMethodDelete(this.deleteConfirmTarget, this.csaaDeleteConfirm);
  }

  private confirmPaymentMethodDelete(account: PaymentAccount, onProceed: () => void): void {
    const type = !!account.card ? 'card' : 'account';
    this.alertController
      .create({
        header: 'Please Confirm',
        message: `Are you sure you want to delete this ${type}?`,
        buttons: ['Cancel', { text: 'Yes', handler: () => onProceed.call(onProceed) }],
      })
      .then((alert) => alert.present());
  }

  public static showDeleteSuccessAlert(onDismiss: () => void): void {
    const alertCtrl = CsaaAppInjector.injector.get(AlertController);
    alertCtrl
      .create({
        header: 'Success!',
        message: 'Your payment method has been successfully removed.',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
            handler() {
              onDismiss.call(onDismiss);
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  public static showDeleteError(onDismiss: () => void): void {
    const alertCtrl = CsaaAppInjector.injector.get(AlertController);
    alertCtrl
      .create({
        header: 'Oops! Something went wrong.',
        message: 'We were unable to complete your request. Please try again later.',
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
            handler() {
              onDismiss.call(onDismiss);
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }
}
