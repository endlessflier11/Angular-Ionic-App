import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, noop, Observable } from 'rxjs';
import {
  Category,
  EventName,
  EventType,
  PaymentAccount,
  PaymentType,
  PaymentWithAutopayEnrollmentResponse,
  Policy,
  PolicyType,
  UpcomingPayment,
  WalletDetails,
} from '../../_core/interfaces';
import { AnalyticsService, PaymentService, RouterService } from '../../_core/services';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { fetchHasFailedFor, withErrorReporter } from '../../_core/helpers';
import { AlertController, ModalController } from '@ionic/angular';
import { interactWithLoader } from '../../_core/operators';
import { WorkingHoursComponent } from '../../_core/ui-kits/working-hours/working-hours.component';
import { PaymentTermsConditionsComponent } from '../_shared/ui-kits/payment-terms-conditions/payment-terms-conditions.component';
import { ContactInfoState } from '../../_core/store/states/contact-info.state';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { CustomerAction, PaymentAction, PolicyAction } from '../../_core/store/actions';
import { PaymentState } from '../../_core/store/states/payment.state';
import { PolicyState } from '../../_core/store/states/policy.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { AutopayTermsConditionsComponent } from '../_shared/ui-kits/autopay-terms-conditions/autopay-terms-conditions.component';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-make-one-time-payment-method',
  templateUrl: './make-one-time-payment.page.html',
  styleUrls: ['./make-one-time-payment.page.scss'],
})
export class MakeOneTimePaymentPage implements OnInit, OnDestroy {
  @Select(PaymentState.upcomingPayments) payments$: Observable<UpcomingPayment[]>;
  @Select(PaymentState.walletDetails) wallet$: Observable<WalletDetails>;
  private subsink = new SubSink();
  public readonly currentTheme: string;
  private policyNumber: string;
  public policySubtitlesExpanded = false;
  public policy: Policy;
  public walletData: WalletDetails;
  public payments: UpcomingPayment[];
  public upcomingPayment: UpcomingPayment;
  methodSelected;
  public selectedPaymentAccount: PaymentAccount;
  amountSelected: PaymentType;
  public enrollInAutopay = false;
  @ViewChild('hoursPopup') private hoursPopup: WorkingHoursComponent;

  public get isCaPolicy(): boolean {
    if (!this.policy) {
      return undefined;
    }
    return this.policy.riskState === 'CA';
  }

  public get paymentMethodLabelText(): string {
    const paymentMethod = this.getSelectedPaymentMethod();
    return paymentMethod ? paymentMethod.shortName : 'Pay With';
  }

  public get payBtnDisabled(): boolean {
    const paymentMethod = this.getSelectedPaymentMethod();
    return (
      !!this.upcomingPayment &&
      ((!this.upcomingPayment.amount && !this.upcomingPayment.otherAmount) ||
        this.upcomingPayment.amount < 0 ||
        !paymentMethod ||
        (!!paymentMethod && paymentMethod.card && paymentMethod.card.expired))
    );
  }

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly paymentService: PaymentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertCtrl: AlertController,
    private readonly modalCtrl: ModalController,
    private readonly makePaymentService: MakePaymentService,
    private readonly analyticsService: AnalyticsService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.subsink.add(
      fetchHasFailedFor(store, CustomerAction.LoadCustomer, PolicyAction.LoadPolicies).subscribe(
        () => this.routerService.navigateRoot()
      )
    );
  }

  ngOnInit() {
    this.dispatchLoadActions();
    this.subsink.add(
      this.wallet$.subscribe((wallet) => {
        if (!this.methodSelected) {
          this.methodSelected = wallet.paymentAccounts.find(
            (p) => p.isPreferred
          )?.paymentAccountToken;
        }
      })
    );
    this.subsink.add(
      this.activatedRoute.paramMap
        .pipe(
          filter((paramMap) => {
            const policyNumber = paramMap.get('policyNumber');
            if (this.policyNumber && this.policyNumber === policyNumber) {
              return false;
            }
            this.policyNumber = policyNumber;
            return true;
          })
        )
        .subscribe(() => {
          this.initialize();
        })
    );
  }

  ionViewWillEnter() {
    this.selectedPaymentAccount = this.makePaymentService.pullSelectedPaymentAccount();
    const activePayment = this.makePaymentService.getActivePayment();
    if (activePayment) {
      const { policyNumber, type, otherAmount } = activePayment;
      this.store.dispatch(
        new PaymentAction.UpdatePaymentTypeAmount(policyNumber, type, otherAmount)
      );
    }
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  private initialize(): void {
    this.subsink.add(
      combineLatest([
        this.store.select(PolicyState.policyData(this.policyNumber)),
        this.store.select(PaymentState.walletDetails),
        this.store.select(PaymentState.upcomingPayments),
        this.store.select(PaymentState.upcomingPaymentForPolicy(this.policyNumber)),
      ])
        .pipe(
          tap(([policy, wallet, payments, payment]) => {
            this.policy = policy;
            this.walletData = wallet;
            this.payments = payments;
            this.upcomingPayment = Object.assign({}, payment);
            this.makePaymentService.setActivePayment(payment);
          })
        )
        .subscribe(withErrorReporter(noop))
    );
  }

  onClickBackBtn() {
    this.routerService.navigateBack('csaa.home').then(noop);
  }

  getSelectedPaymentMethod(): PaymentAccount {
    let paymentMethod;
    if (!!this.methodSelected) {
      paymentMethod = this.store.selectSnapshot(PaymentState.paymentMethod(this.methodSelected));
    }
    return paymentMethod;
  }

  onAmountSelectionChange(event) {
    this.amountSelected = event?.selection;
    if (this.amountSelected === PaymentType.other) {
      this.upcomingPayment.otherAmount = event.value;
    }
  }

  onClickEditPaymentAccount(account: PaymentAccount): void {
    const normalizeBankType = (a: PaymentAccount): string =>
      a.account.bankAccountType.toLocaleLowerCase() === 'savings' ? 'savings' : 'checking';
    const suffix = account.card ? 'card' : normalizeBankType(account) + '-account';
    this.methodSelected = account?.paymentAccountToken;
    this.makePaymentService.selectPaymentAccount(account);
    this.makePaymentService.setActivePayment(this.upcomingPayment);
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

  async pay() {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(this.upcomingPayment).toFixed(2);
    const message = `A payment will be made from your selected payment method for $${amountBeingPaid}`;
    const alert = await this.alertCtrl.create({
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: () => {
            this.trackPayment(this.upcomingPayment, 'Confirm');
            this.callMakePaymentService(this.upcomingPayment);
          },
        },
      ],
    });
    alert.onDidDismiss().then(({ role: btnRole }) => {
      if (btnRole === 'cancel') {
        this.trackPaymentAlertCanceled(this.upcomingPayment);
      }
    });
    await alert.present();
  }

  callMakePaymentService(payment: UpcomingPayment) {
    const paymentAccount = this.getSelectedPaymentMethod();
    const amountBeingPaid = payment.otherAmount || payment.amount;
    this.paymentService
      .makePayment(paymentAccount, payment, amountBeingPaid)
      .pipe(
        tap(() => {
          this.store.dispatch([PaymentAction.ReloadPayments, PaymentAction.ReloadHistory]);
        }),
        switchMap((paymentResponse) => {
          if (!this.enrollInAutopay) {
            return of(paymentResponse);
          }

          return this.paymentService.enrollPolicyForAutopay(this.policy, paymentAccount).pipe(
            switchMap((result) => of({ ...paymentResponse, enrollmentSucceded: result })),
            catchError((e) => {
              console.error({ e });
              return of({ ...paymentResponse, enrollmentSucceded: false });
            })
          );
        }),
        interactWithLoader<PaymentWithAutopayEnrollmentResponse>()
      )
      .subscribe(
        withErrorReporter(
          ({ statusDescription, receiptNumber }) => {
            this.analyticsService.trackEvent(
              EventName.PAYMENT_SUCCESSFUL_DETAILS,
              Category.payments,
              {
                event_type: EventType.AUTOMATED_SYSTEM_PROCESS,
                ...AnalyticsService.mapPaymentPolicy(payment),
                payment_amount: amountBeingPaid,
                past_due: payment.isPaymentDue,
                min_amt_paid: payment.minimumAmount ? 'true' : 'false',
                payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
                receipt_number: receiptNumber,
              }
            );
            this.makePaymentSuccess(
              statusDescription,
              receiptNumber,
              paymentAccount,
              amountBeingPaid
            );
          },
          () => {
            this.trackPaymentFailed(payment);
            this.makePaymentFailure().then(noop);
          }
        )
      );
  }

  private async makePaymentFailure() {
    const servicePhoneNumber = this.store.selectSnapshot(ContactInfoState.serviceNumber());
    const alert = await this.alertCtrl.create({
      header: 'Payment Failed',
      message: `Sorry, we weren't able to process your payment. Please call Service at ${servicePhoneNumber}.`,
      buttons: [
        {
          text: 'Call Service',
          handler: () => {
            this.hoursPopup.show();
            // TODO: handle analytics tracking in the popup
          },
        },
        {
          text: 'Try Again',
          handler: () => {
            this.pay().then(noop);
          },
        },
      ],
    });
    await alert.present();
  }

  private trackPayment(payment, selection: 'Decline' | 'Confirm') {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(payment);
    const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();

    this.analyticsService.trackEvent(EventName.PAYMENT_CONFIRMED, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      ...AnalyticsService.mapPaymentPolicy(payment),
      selection,
      payment_amount: amountBeingPaid,
      past_due: payment.isPastDue,
      min_amt_paid: payment.minimumAmount ? 'true' : 'false',
      payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
    });
  }

  private trackPaymentFailed(payment) {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(payment);
    const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
    this.analyticsService.trackEvent(EventName.PAYMENT_FAILED, Category.payments, {
      event_type: EventType.AUTOMATED_SYSTEM_PROCESS,
      ...AnalyticsService.mapPaymentPolicy(payment),
      payment_amount: amountBeingPaid,
      past_due: payment.isPastDue,
      min_amt_paid: payment.minimumAmount ? 'true' : 'false',
      payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
    });
  }

  public trackPaymentAlertCanceled(payment: UpcomingPayment) {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(payment);
    const paymentAccount: PaymentAccount = this.getSelectedPaymentMethod();
    let eventProperties = {
      event_type: EventType.OPTION_SELECTED,
      payment_method: AnalyticsService.mapPaymentMethod(paymentAccount),
      payment_amount: amountBeingPaid,
      selection: 'Decline',
      policies: [],
    };
    const parsePolicy = (p: UpcomingPayment) => ({
      policy_number: p.policyNumber,
      policy_type: PolicyType[p.policyType],
      policy_state: p.policyRiskState,
      past_due: !!p.isPastDue,
      min_amt_paid: amountBeingPaid >= p.minimumAmount,
    });
    eventProperties = {
      ...eventProperties,
      policies: [parsePolicy(payment)],
    };

    this.analyticsService.trackEvent(
      EventName.PAYMENT_AMOUNT_CANCELLED,
      Category.payments,
      eventProperties
    );
  }

  private makePaymentSuccess(
    status: string,
    receiptNumber: string,
    paymentAccount: PaymentAccount,
    amount: number
  ) {
    this.makePaymentService.updatePaymentResult(
      this.policyNumber,
      status,
      receiptNumber,
      paymentAccount,
      amount
    );
    this.onClickBackBtn();
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

  private dispatchLoadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() => this.store.dispatch(new PaymentAction.LoadPayments())),
        switchMap(() => this.store.dispatch(new PaymentAction.LoadWallet()))
      )
      .subscribe(withErrorReporter(noop));
  }

  async openAutoPayTerms() {
    const modal = await this.modalCtrl.create({
      component: AutopayTermsConditionsComponent,
    });
    await modal.present();
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_CLICKED, Category.payments, {
      event_type: EventType.FILE_DOWNLOADED,
    });
  }
}
