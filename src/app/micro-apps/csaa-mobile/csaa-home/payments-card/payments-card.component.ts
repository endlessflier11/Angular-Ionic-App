import { Component, Input } from '@angular/core';
import { PaymentAccount, UpcomingPayment } from '../../_core/interfaces/payment.interface';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { noop, Observable } from 'rxjs';
import { AnalyticsService, RouterService } from '../../_core/services';
import { PaymentState } from '../../_core/store/states/payment.state';
import { Select, Store } from '@ngxs/store';
import { CustomerState } from '../../_core/store/states/customer.state';
import { CustomerSearchResponse } from '../../_core/interfaces';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'csaa-payments-card',
  templateUrl: './payments-card.component.html',
  styleUrls: ['./payments-card.component.scss'],
})
export class PaymentsCardComponent {
  @Input() payments: UpcomingPayment[] = [];
  @Input() loading = false;
  @Input() timezone: string = undefined;

  @Select(CustomerState.customerData) customerSearch$: Observable<CustomerSearchResponse>;

  // TODO: move this state to store
  selectedPaymentAccount: PaymentAccount;

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly analyticsService: AnalyticsService,
    private readonly alertCtrl: AlertController
  ) {}

  openPaymentsPage() {
    const [payment] = this.payments;
    this.analyticsService.trackEvent(EventName.PAYMENTS_ACCESSED, Category.payments, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Payments',
      ...AnalyticsService.mapPaymentPolicy(payment),
    });
    this.routerService.navigateForward('csaa.payment.index').then(noop);
  }

  openTransactionHistoryPage() {
    this.analyticsService.trackEvent(
      EventName.TRANSACTION_HISTORY_PAGE_SELECTED,
      Category.payments,
      {
        event_type: EventType.LINK_ACCESSED,
        link: 'Payments',
      }
    );
    this.routerService.navigateForward('csaa.payment.history').then(noop);
  }

  openPayAllPolicies() {
    this.routerService.navigateForward('csaa.payment.payall').then(noop);
  }

  isPaymentSuccess(_: UpcomingPayment) {
    return false;
    // TODO: Check successful payment notice
    //    return !!this.paymentResults[payment.policyNumber]?.result;
  }

  getSelectedPaymentMethod(): PaymentAccount {
    if (this.selectedPaymentAccount) {
      return this.selectedPaymentAccount;
    }
    return this.store.selectSnapshot(PaymentState.preferredPaymentAccount);
  }

  goToPayNow(payment: UpcomingPayment) {
    this.trackMakePaymentEvent([payment]);
    // TODO: refactor using store state
    // this.makePaymentService.selectPaymentAccount(this.getSelectedPaymentMethod());
    // this.makePaymentService.setPaymentResult(this.paymentResults);

    this.routerService
      .navigateForward('csaa.payment.make.payment', { policyNumber: payment.policyNumber })
      .then(noop);
  }

  async goToAutopaySettings(payment: UpcomingPayment) {
    if (!payment?.isPastDue) {
      return this.routerService
        .navigateForward('csaa.payment.autopay.settings', {
          policyNumber: payment.policyNumber,
        })
        .then(noop);
    }

    this.analyticsService.trackEvent(EventName.AUTOPAY_ENROLLMENT_STOPPED, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      ...AnalyticsService.mapPaymentPolicy(payment),
    });
    const alert = await this.alertCtrl.create({
      header: 'Unable to Proceed',
      message:
        'We are unable to process your AutoPay enrollment request due to a past due balance on your account.' +
        ' To continue, you will need to make a payment on your account.',
      buttons: ['OK'],
    });
    return await alert.present();
  }

  trackMakePaymentEvent(payments: UpcomingPayment[]): void {
    this.analyticsService.trackEvent(EventName.MAKE_A_PAYMENT_SELECTED, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Make A Payment',
      amount_due: payments.reduce(
        (currentAmount, payment) => currentAmount + payment.minimumAmount,
        0
      ),
      ...AnalyticsService.mapPaymentPolicy(...payments),
    });
  }
}
