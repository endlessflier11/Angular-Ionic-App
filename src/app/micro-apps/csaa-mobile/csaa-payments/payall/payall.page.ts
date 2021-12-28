import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import {
  Category,
  EventName,
  EventType,
  PaymentAccount,
  PaymentType,
  PolicyType,
  UpcomingPayment,
  UpcomingPaymentModel,
  WalletDetails,
} from '../../_core/interfaces';
import { noop, Observable } from 'rxjs';
import { AnalyticsService, parseToCent, PaymentService, RouterService } from '../../_core/services';
import { PaymentState } from '../../_core/store/states/payment.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { CustomerAction, PaymentAction, PolicyAction } from '../../_core/store/actions';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { withErrorReporter } from '../../_core/helpers';
import { AlertController, IonRefresher, ModalController } from '@ionic/angular';
import { PaymentTermsConditionsComponent } from '../_shared/ui-kits/payment-terms-conditions/payment-terms-conditions.component';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { ContactInfoState } from '../../_core/store/states/contact-info.state';
import { WorkingHoursComponent } from '../../_core/ui-kits/working-hours/working-hours.component';

@Component({
  selector: 'csaa-payall',
  templateUrl: './payall.page.html',
  styleUrls: ['./payall.page.scss'],
})
export class PayallPage implements OnDestroy, OnInit {
  @Select(PaymentState.upcomingPayments) payments$: Observable<UpcomingPayment[]>;
  @Select(PaymentState.walletDetails) wallet$: Observable<WalletDetails>;
  @ViewChild('hoursPopup') private hoursPopup: WorkingHoursComponent;

  combinedPayment: UpcomingPayment;
  subsink = new SubSink();
  currentTheme: string;
  loading = true;
  amountSelected: PaymentType;
  methodSelected;
  private refresher: IonRefresher;

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly analyticsService: AnalyticsService,
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController,
    private readonly makePaymentService: MakePaymentService,
    private readonly paymentService: PaymentService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  ngOnInit() {
    this.subsink.add(
      this.payments$.subscribe((payments) => {
        this.combinedPayment = this.createPayment(payments);
      })
    );
    this.dispatchLoadActions();
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  onClickBackBtn() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.navigateBack('csaa.home').then(noop);
  }

  createPayment(payments) {
    const combinedPayment = Object.assign({}, payments[0]);
    combinedPayment.allPolicies = true;
    combinedPayment.policyNumber = 'ALL';
    combinedPayment.minimumAmount = 0;
    combinedPayment.remainingPremium = 0;

    payments.forEach((currentPayment) => {
      if (currentPayment.remainingPremium > 0) {
        combinedPayment.remainingPremium += parseToCent(currentPayment.remainingPremium);
      }

      if (currentPayment.minimumAmount > 0) {
        combinedPayment.minimumAmount += parseToCent(currentPayment.minimumAmount);
      }
    });

    // Revert from cent since we completed calculation
    combinedPayment.minimumAmount = combinedPayment.minimumAmount / 100;
    combinedPayment.remainingPremium = combinedPayment.remainingPremium / 100;

    return new UpcomingPaymentModel(combinedPayment);
  }

  onAmountSelectionChange(event) {
    this.amountSelected = event?.selection;
    this.combinedPayment.otherAmount = null;
    if (this.amountSelected === PaymentType.other) {
      this.combinedPayment.otherAmount = event.value;
    }
  }

  onMethodChange(event) {
    this.methodSelected = event?.detail?.value;
  }

  doRefresh(refresher) {
    this.loading = true;
    this.refresher = refresher;
    this.dispatchLoadActions();
  }

  private dispatchLoadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() => this.store.dispatch(new PaymentAction.LoadPayments())),
        switchMap(() =>
          this.store.dispatch([new PaymentAction.LoadHistory(), new PaymentAction.LoadWallet()])
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter(noop));
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
    }
  }

  async openPaymentTerms() {
    const modal = await this.modalCtrl.create({
      component: PaymentTermsConditionsComponent,
    });
    await modal.present();
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_CLICKED, Category.payments, {
      event_type: EventType.FILE_DOWNLOADED,
    });
  }

  onClickEditPaymentAccount(account: PaymentAccount): void {
    const normalizeBankType = (a: PaymentAccount): string =>
      a.account.bankAccountType.toLocaleLowerCase() === 'savings' ? 'savings' : 'checking';
    const suffix = account.card ? 'card' : normalizeBankType(account) + '-account';
    this.methodSelected = account?.paymentAccountToken;
    this.makePaymentService.selectPaymentAccount(account);
    this.makePaymentService.setActivePayment(this.combinedPayment);
    this.makePaymentService.setReturnPathFromAmountMethodPages('csaa.payment.payall');
    this.routerService
      .navigateForward(`csaa.payment.method.${suffix}.edit`, {
        account: account.paymentAccountToken,
      })
      .then(noop);
  }

  onAddNewPaymentMethod() {
    this.makePaymentService.setReturnPathFromAmountMethodPages('csaa.payment.payall');
    this.routerService.navigateForward(`csaa.payment.add-payment-method`).then(noop);
  }

  get amount() {
    return this.getAmount(this.amountSelected);
  }

  private getAmount(amountSelected: PaymentType) {
    switch (amountSelected) {
      case PaymentType.minimum:
        return this.combinedPayment?.minimumAmount;
      case PaymentType.remaining:
        return this.combinedPayment?.remainingPremium;
      case PaymentType.other:
        return this.combinedPayment?.otherAmount;
      default:
        return 0;
    }
  }

  //
  //   const amountBeingPaid = this.getAmount(this.amountSelected)?.toFixed(2);
  //   const message = `A payment will be made from your selected payment method for $${amountBeingPaid}`;
  //   const alert = await this.alertCtrl.create({
  //     header: 'Are you sure?',
  //     message,
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Confirm',
  //         handler: () => {
  //           this.trackPayment(this.combinedPayment, 'Confirm');
  //           this.callMakePaymentService(this.combinedPayment);
  //         },
  //       },
  //     ],
  //   });
  //   alert.onDidDismiss().then(({ role: btnRole }) => {
  //     if (btnRole === 'cancel') {
  //       this.trackPaymentAlertCanceled(this.combinedPayment);
  //     }
  //   });
  //   await alert.present();
  // }
  //
  // callMakePaymentService(payment: UpcomingPayment) {
  //   const paymentAccount = this.getSelectedPaymentMethod();
  //   const amountBeingPaid = this.getAmount(this.amountSelected);
  //   // payment.otherAmount = null;
  //   // payment.amount = amountBeingPaid;
  //   this.paymentService
  //     .makePayment(paymentAccount, payment, amountBeingPaid)
  //     .pipe(
  //       tap(() => {
  //         this.store.dispatch([PaymentAction.ReloadPayments, PaymentAction.ReloadHistory]);
  //       }),
  //       interactWithLoader<MakePaymentResponse>(),
  //     )
  //     .subscribe(
  //       withErrorReporter(
  //         ({ statusDescription, receiptNumber }) => {
  //           this.analyticsService.trackEvent(
  //             EventName.PAYMENT_SUCCESSFUL_DETAILS,
  //             Category.payments,
  //             {
  //               event_type: EventType.AUTOMATED_SYSTEM_PROCESS,
  //               ...AnalyticsService.mapPaymentPolicy(payment),
  //               payment_amount: amountBeingPaid,
  //               past_due: payment.isPaymentDue,
  //               min_amt_paid: payment.minimumAmount ? 'true' : 'false',
  //               payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
  //               receipt_number: receiptNumber,
  //             },
  //           );
  //           this.makePaymentSuccess(
  //             statusDescription,
  //             receiptNumber,
  //             paymentAccount,
  //             amountBeingPaid,
  //           );
  //         },
  //         () => {
  //           this.trackPaymentFailed(payment);
  //           this.makePaymentFailure().then(noop);
  //         },
  //       ),
  //     );
  // }
  //
  // private async makePaymentFailure() {
  //   const servicePhoneNumber = this.store.selectSnapshot(ContactInfoState.serviceNumber());
  //   const alert = await this.alertCtrl.create({
  //     header: 'Payment Failed',
  //     message: `Sorry, we weren't able to process your payment. Please call Service at ${servicePhoneNumber}.`,
  //     buttons: [
  //       {
  //         text: 'Call Service',
  //         handler: () => {
  //           this.hoursPopup.show();
  //         },
  //       },
  //       {
  //         text: 'Try Again',
  //         handler: () => {
  //           this.onPayClicked().then(noop);
  //         },
  //       },
  //     ],
  //   });
  //   await alert.present();
  // }
  //
  // private trackPayment(payment, selection: 'Decline' | 'Confirm') {
  //   const amountBeingPaid = PaymentService.computeAmountBeingPaid(payment);
  //   const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
  //
  //   this.analyticsService.trackEvent(EventName.PAYMENT_CONFIRMED, Category.payments, {
  //     event_type: EventType.OPTION_SELECTED,
  //     ...AnalyticsService.mapPaymentPolicy(payment),
  //     selection,
  //     payment_amount: amountBeingPaid,
  //     past_due: payment.isPastDue,
  //     min_amt_paid: payment.minimumAmount ? 'true' : 'false',
  //     payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
  //   });
  // }
  //
  // private trackPaymentFailed(payment) {
  //   const amountBeingPaid = PaymentService.computeAmountBeingPaid(payment);
  //   const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
  //   this.analyticsService.trackEvent(EventName.PAYMENT_FAILED, Category.payments, {
  //     event_type: EventType.AUTOMATED_SYSTEM_PROCESS,
  //     ...AnalyticsService.mapPaymentPolicy(payment),
  //     payment_amount: amountBeingPaid,
  //     past_due: payment.isPastDue,
  //     min_amt_paid: payment.minimumAmount ? 'true' : 'false',
  //     payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
  //   });
  // }
  //
  // public trackPaymentAlertCanceled(payment: UpcomingPayment) {
  //   const amountBeingPaid = PaymentService.computeAmountBeingPaid(payment);
  //   const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
  //   let eventProperties = {
  //     event_type: EventType.OPTION_SELECTED,
  //     payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
  //     payment_amount: amountBeingPaid,
  //     selection: 'Decline',
  //     policies: [],
  //   };
  //   const parsePolicy = (p: UpcomingPayment) => ({
  //     policy_number: p.policyNumber,
  //     policy_type: PolicyType[p.policyType],
  //     policy_state: p.policyRiskState,
  //     past_due: !!p.isPastDue,
  //     min_amt_paid: amountBeingPaid >= p.minimumAmount,
  //   });
  //   eventProperties = {
  //     ...eventProperties,
  //     policies: [parsePolicy(payment)],
  //   };
  //
  //   this.analyticsService.trackEvent(
  //     EventName.PAYMENT_AMOUNT_CANCELLED,
  //     Category.payments,
  //     eventProperties,
  //   );
  // }
  //
  private async makePaymentSuccess(
    status: string,
    receiptNumber: string,
    paymentAccount: PaymentAccount,
    amount: number
  ) {
    console.log('Make Payment Success', { status, receiptNumber, paymentAccount, amount });

    const alert = await this.alertCtrl.create({
      header: 'Payment Success',
      message: 'Success Message will be implemented by MM-3201',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.onClickBackBtn();
          },
        },
      ],
    });
    await alert.present();

    // this.makePaymentService.updatePaymentResult(
    //   //this.policyNumber,
    //   status,
    //   receiptNumber,
    //   paymentAccount,
    //   amount,
    // );
    // MM-3201
  }

  private getSelectedPaymentMethod() {
    let paymentMethod;
    if (!!this.methodSelected) {
      paymentMethod = this.store.selectSnapshot(PaymentState.paymentMethod(this.methodSelected));
    }
    return paymentMethod;
  }

  public get payBtnDisabled(): boolean {
    const paymentMethod = this.getSelectedPaymentMethod();
    const amount = this.getAmount(this.amountSelected);

    return (
      !amount || !paymentMethod || (paymentMethod.card && paymentMethod.card.expired) || amount < 0
    );
  }

  private getPayments() {
    return [...this.store.selectSnapshot(PaymentState.upcomingPayments)];
  }

  async onPayClicked() {
    this.combinedPayment.type = this.amountSelected;
    const paymentsWithPayableAmount: UpcomingPayment[] = this.getPayments().map(
      (p) =>
        new UpcomingPaymentModel({
          ...p,
          type: this.combinedPayment.type,
        })
    );
    this.trackMakePaymentEvent(paymentsWithPayableAmount);
    const amountBeingPaid = this.getAmount(this.amountSelected);

    const alert = await this.alertCtrl.create({
      header: `Are you sure?`,
      message: `A payment will be made from your selected payment method for $${amountBeingPaid}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: () => {
            this.callMakePaymentServiceForPayAll(this.combinedPayment, paymentsWithPayableAmount);
          },
        },
      ],
    });
    alert.onDidDismiss().then(({ role }) => {
      if (role === 'cancel') {
        this.onPaymentAlertCanceled(role, paymentsWithPayableAmount);
      }
    });
    await alert.present();
  }

  callMakePaymentServiceForPayAll(combinedPayment: UpcomingPayment, payments: UpcomingPayment[]) {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(payments);

    const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
    // this.payallTransactionUnderway = true;
    this.trackPaymentConfirmedEvent(payments, amountBeingPaid, paymentAccount);
    this.paymentService
      .payAllPolicies(this.getSelectedPaymentMethod(), payments)
      .pipe(
        tap(() => this.store.dispatch([PaymentAction.ReloadPayments, PaymentAction.ReloadHistory]))
        // finalize(() => (this.payallTransactionUnderway = false))
      )
      .subscribe(
        withErrorReporter(
          (result) => {
            const effectivePayments = payments.filter(
              UpcomingPaymentModel.getPaymentFilterByFn(combinedPayment.type)
            );
            const { statusDescription, receiptNumber } = result;
            this.analyticsService.trackEvent(
              EventName.PAYMENT_SUCCESSFUL_DETAILS,
              Category.payments,
              {
                event_type: EventType.AUTOMATED_SYSTEM_PROCESS,
                ...AnalyticsService.mapPaymentPolicy(...effectivePayments),
                payment_amount: amountBeingPaid,
                past_due: effectivePayments.map((p: UpcomingPayment) => [p.isPaymentDue]),
                min_amt_paid: effectivePayments.map((p: UpcomingPayment) => [
                  p.minimumAmount ? 'true' : 'false',
                ]),
                payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
                receipt_number: receiptNumber,
              }
            );
            // TODO: Notify success
            // const amountByPolicy = PaymentService.detailAmountBeingPaid(payments);
            // this.payAllPaymentsSuccessful = statusDescription === 'SUCC';
            // effectivePayments.map((payment) => {
            //   this.makePaymentSuccess(
            //     payment.policyNumber,
            //     statusDescription,
            //     receiptNumber,
            //     paymentAccount,
            //     amountByPolicy[payment.policyNumber]
            //   );
            // });
            this.makePaymentSuccess(
              statusDescription,
              receiptNumber,
              paymentAccount,
              amountBeingPaid
            );
          },
          async (err) => {
            console.log('CSAA: ', { err });
            this.analyticsService.trackEvent(EventName.PAYMENT_FAILED, Category.payments, {
              event_type: EventType.AUTOMATED_SYSTEM_PROCESS,

              ...AnalyticsService.mapPaymentPolicy(...payments),
              method: 'credit card',
            });
            const servicePhoneNumber = this.store.selectSnapshot(ContactInfoState.serviceNumber());
            const alert = await this.alertCtrl.create({
              header: 'Payment Failed',
              subHeader: `Sorry, we weren't able to process your payment. Please call Service at ${servicePhoneNumber}`,
              buttons: [
                {
                  text: 'Call Service',
                  handler: () => {
                    this.hoursPopup.show();
                  },
                },
                {
                  text: 'Try Again',
                  handler: () => {
                    this.onPayClicked();
                  },
                },
              ],
            });
            await alert.present();
          }
        )
      );
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

  trackPaymentConfirmedEvent(
    payments: UpcomingPayment[],
    amountBeingPaid: number,
    paymentAccount: PaymentAccount,
    selection: 'Decline' | 'Confirm' = 'Confirm'
  ): void {
    this.analyticsService.trackEvent(EventName.PAYMENT_CONFIRMED, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      ...AnalyticsService.mapPaymentPolicy(...payments),
      selection,
      payment_amount: amountBeingPaid,
      past_due: payments.some((p) => p.isPastDue),
      min_amt_paid: payments[0].type === PaymentType.minimum ? 'true' : 'false',
      payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
    });
  }

  public onPaymentAlertCanceled(roleSelection, payments: UpcomingPayment[]) {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(payments);
    const isCancel = roleSelection === 'cancel';
    const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
    let eventProperties = {
      event_type: EventType.OPTION_SELECTED,
      payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
      payment_amount: amountBeingPaid,
      selection: isCancel ? 'Decline' : 'Confirm',
      policies: [],
    };
    const parsePolicy = (p: UpcomingPayment) => ({
      policy_number: p.policyNumber,
      policy_type: PolicyType[p.policyType],
      policy_state: p.policyRiskState,
      past_due: !!p.isPastDue,
      min_amt_paid: true,
    });
    eventProperties = {
      ...eventProperties,
      policies: payments.map(parsePolicy),
    };
    this.analyticsService.trackEvent(
      EventName.PAYMENT_AMOUNT_CANCELLED,
      Category.payments,
      eventProperties
    );
  }
}
