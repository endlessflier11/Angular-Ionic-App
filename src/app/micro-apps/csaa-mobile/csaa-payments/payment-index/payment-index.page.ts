/* eslint-disable @typescript-eslint/unified-signatures */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { concat, noop, Observable, Subscription } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { AlertController, IonRefresher, Platform } from '@ionic/angular';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { WorkingHoursComponent } from '../../_core/ui-kits/working-hours/working-hours.component';
import { CsaaPayAllPoliciesCardComponent } from '../_shared/ui-kits/csaa-pay-all-policies-card/csaa-pay-all-policies-card.component';
import { fetchHasFailedFor, unsubscribeIfPresent, withErrorReporter } from '../../_core/helpers';
import {
  AutoPayEnrollmentResponse,
  Bill,
  Category,
  CustomerSearchResponse,
  EventName,
  EventType,
  IonViewWillEnter,
  PaymentAccount,
  PaymentHistory,
  PaymentResult,
  PaymentType,
  Policy,
  PolicyType,
  UpcomingPayment,
  UpcomingPaymentModel,
  WalletDetails,
} from '../../_core/interfaces';
import {
  AnalyticsService,
  PaymentService,
  PdfDisplayService,
  RouterService,
} from '../../_core/services';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { ContactInfoState } from '../../_core/store/states/contact-info.state';
import { format } from 'date-fns';
import { CustomerAction, PaymentAction, PolicyAction } from '../../_core/store/actions';
import { CustomerState } from '../../_core/store/states/customer.state';
import { PolicyState } from '../../_core/store/states/policy.state';
import { PaymentState } from '../../_core/store/states/payment.state';
import { FetchState } from '../../_core/store/states/fetch.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { interactWithLoader } from '../../_core/operators';
import { PolicyDocument } from '../../_core/interfaces/document.interface';

@Component({
  selector: 'app-csaa-payment-index',
  templateUrl: './payment-index.page.html',
})
export class PaymentIndexPage implements OnInit, OnDestroy, IonViewWillEnter {
  @Select(CustomerState.customerData) customerSearch$: Observable<CustomerSearchResponse>;
  @Select(PolicyState.allPolicies) policies$: Observable<Policy[]>;
  @Select(PaymentState.upcomingPayments) payments$: Observable<UpcomingPayment[]>;
  @Select(PaymentState.paymentHistory) history$: Observable<PaymentHistory>;
  @Select(PaymentState.walletDetails) wallet$: Observable<WalletDetails>;
  @Select(PaymentState.latestBills) latestBills$: Observable<Bill[]>;
  @Select(FetchState.isLoading(PaymentAction.LoadPayments)) isPaymentsLoading$: Observable<boolean>;
  @ViewChild('hoursPopup') private hoursPopup: WorkingHoursComponent;
  @ViewChild(CsaaPayAllPoliciesCardComponent)
  private payAllCardComponent: CsaaPayAllPoliciesCardComponent;

  paymentResults: PaymentResult = {};
  subsink = new SubSink();
  currentTheme: string;
  loading = true;
  selectedPaymentAccount: PaymentAccount;
  backButtonSubscription: Subscription;
  payallTransactionUnderway = false;
  payAllPaymentsSuccessful = false;

  // Special props for displaying bills
  autoPayEnrollmentStatusMap: { [policyNumber: string]: AutoPayEnrollmentResponse | null } = {};
  isPaidInFullStatusMap: { [policyNumber: string]: boolean } = {};
  availableDocumentsMap: { [policyNumber: string]: PolicyDocument[] } = {};

  private refresher: IonRefresher;

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly paymentService: PaymentService,
    private readonly makePaymentService: MakePaymentService,
    private readonly alertCtrl: AlertController,
    private readonly analyticsService: AnalyticsService,
    private readonly platform: Platform,
    private readonly pdfDisplayService: PdfDisplayService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.subsink.add(
      fetchHasFailedFor(store, CustomerAction.LoadCustomer, PolicyAction.LoadPolicies).subscribe(
        () => this.routerService.navigateRoot()
      ),
      this.payments$.subscribe((payments) => {
        // @ts-ignore
        this.autoPayEnrollmentStatusMap = Object.fromEntries(
          payments.map((p) => [p.policyNumber, p.autopayEnrollment || null])
        );
        // @ts-ignore
        this.isPaidInFullStatusMap = Object.fromEntries(
          payments.map((p) => [p.policyNumber, p.remainingPremium <= 0])
        );
      })
    );
  }

  doRefresh(refresher) {
    this.loading = true;
    this.makePaymentService.reset();
    this.selectedPaymentAccount = null;
    this.refresher = refresher;
    this.dispatchLoadActions();
  }

  ngOnInit() {
    this.loading = true;
    this.dispatchLoadActions();
  }
  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  ionViewWillEnter() {
    this.selectedPaymentAccount = this.makePaymentService.pullSelectedPaymentAccount();
    this.updateSinglePaymentData(this.makePaymentService.getActivePayment());
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.onClickBackBtn()
    );
    this.paymentResults = {
      ...this.paymentResults,
      ...this.makePaymentService.pullPaymentResults(),
    };
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  onClickBackBtn() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.navigateBack('csaa.home').then(noop);
  }

  openPaymentHistory(policy) {
    this.routerService
      .navigateForward('csaa.payment.history', { policyNumber: policy.number })
      .then(noop);
  }

  openBill(bill: Bill) {
    this.store
      .dispatch(new PolicyAction.LoadPolicyDocuments(bill.policyNumber))
      .pipe(interactWithLoader())
      .subscribe(async () => {
        const documents = this.store.selectSnapshot(
          PolicyState.documentsForPolicy(bill.policyNumber)
        );
        // If Auto Pay is enrolled, use documentPolicyDocumentType.AutopaySchedule
        const documentFilterValue = this.autoPayEnrollmentStatusMap[bill.policyNumber]?.autoPay
          ? 'Auto Pay Schedule'
          : 'Billing';
        const documentFilterKey = this.autoPayEnrollmentStatusMap[bill.policyNumber]?.autoPay
          ? 'docName'
          : 'docType';
        // documents list already sorted at the api response level
        // Ref: src/app/micro-apps/csaa-mobile/_core/services/policy.service.ts:334
        // So we simply grab the first match
        const billDocument = documents.find((d) => d[documentFilterKey] === documentFilterValue);
        console.log({ billDocument, documents });
        if (billDocument) {
          this.pdfDisplayService.showDocumentOptions(billDocument);
        } else {
          const policy = this.store.selectSnapshot(PolicyState.policyData(bill.policyNumber));
          this.analyticsService.trackEvent(EventName.ERROR_NOTIFICATION, Category.documents, {
            event_type: EventType.MESSAGED,
            selection: 'Installment Bill',
            document_category: 'Billing & Payments',
            document_type: 'Billing Documents',
            document_name: 'Installment Bill',
            document_effective: 'current',
            process_date: bill.transactionDate,

            ...AnalyticsService.mapPolicy(policy),
          });
          this.pdfDisplayService.showDocumentErrorAlert();
        }
      });
  }

  isPaymentSuccess(payment: UpcomingPayment) {
    return !!this.paymentResults[payment.policyNumber]?.result;
  }

  getSelectedPaymentMethod(): PaymentAccount {
    if (this.selectedPaymentAccount) {
      return this.selectedPaymentAccount;
    }
    return this.store.selectSnapshot(PaymentState.preferredPaymentAccount);
  }

  selectAmount(payment: UpcomingPayment) {
    this.makePaymentService.setUpcomingPayments(this.getPayments());
    this.makePaymentService.setActivePayment(payment);
    this.makePaymentService.setReturnPathFromAmountMethodPages('csaa.payment.index');
    this.makePaymentService.selectPaymentAccount(this.getSelectedPaymentMethod());
    this.routerService.navigateForward('csaa.payment.amount').then(noop);
  }

  selectPaymentAccount(payment: UpcomingPayment) {
    this.makePaymentService.setUpcomingPayments(this.getPayments());
    this.makePaymentService.setActivePayment(payment);
    this.makePaymentService.setReturnPathFromAmountMethodPages('csaa.payment.index');
    this.makePaymentService.selectPaymentAccount(this.getSelectedPaymentMethod());
    this.routerService.navigateForward('csaa.payment.method').then(noop);
  }

  makePayment(payment: UpcomingPayment) {
    this.trackMakePaymentEvent([payment]);
    this.makePaymentService.selectPaymentAccount(this.getSelectedPaymentMethod());
    this.makePaymentService.setPaymentResult(this.paymentResults);
    this.routerService
      .navigateForward('csaa.payment.make.payment', { policyNumber: payment.policyNumber })
      .then(noop);
  }

  async payAllPolicies(combinedPayment: UpcomingPayment) {
    const paymentsWithPayableAmount: UpcomingPayment[] = this.getPayments().map(
      (p) =>
        new UpcomingPaymentModel({
          ...p,
          type: combinedPayment.type,
        })
    );
    const amountBeingPaid =
      PaymentService.computeAmountBeingPaid(paymentsWithPayableAmount).toFixed(2);
    this.trackMakePaymentEvent(paymentsWithPayableAmount);

    const alert = await this.alertCtrl.create({
      header: `A payment will be made from your selected payment method for $${amountBeingPaid}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: () => {
            this.callMakePaymentServiceForPayAll(combinedPayment, paymentsWithPayableAmount);
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
    this.payallTransactionUnderway = true;
    this.trackPaymentConfirmedEvent(payments, amountBeingPaid, paymentAccount);
    this.paymentService
      .payAllPolicies(this.getSelectedPaymentMethod(), payments)
      .pipe(
        tap(() => this.store.dispatch([PaymentAction.ReloadPayments, PaymentAction.ReloadHistory])),
        finalize(() => (this.payallTransactionUnderway = false))
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
            const amountByPolicy = PaymentService.detailAmountBeingPaid(payments);
            this.payAllPaymentsSuccessful = statusDescription === 'SUCC';
            effectivePayments.map((payment) => {
              this.makePaymentSuccess(
                payment.policyNumber,
                statusDescription,
                receiptNumber,
                paymentAccount,
                amountByPolicy[payment.policyNumber]
              );
            });
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
                    this.payAllPolicies(combinedPayment);
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

  /**
   *
   */
  updateSinglePaymentData(activePayment: UpcomingPayment) {
    if (!activePayment) {
      return;
    }

    if (activePayment.allPolicies) {
      this.payAllCardComponent.setPaymentAmountType(activePayment.type);
      this.store.dispatch(
        new PaymentAction.UpdatePaymentTypeAmount(null, activePayment.type, null)
      );
      return;
    }

    const { policyNumber, type, otherAmount } = activePayment;
    this.store.dispatch(new PaymentAction.UpdatePaymentTypeAmount(policyNumber, type, otherAmount));
  }
  renderSinglePolicyHistoryCard(history: PaymentHistory, policies: Policy[]) {
    return policies?.length === 1 && !!history && history[policies[0].number]?.length > 0;
  }

  public getPolicyByNumber(policyNumber: string): Policy {
    return this.store.selectSnapshot(PolicyState.policyData(policyNumber));
  }

  private dispatchLoadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.ReloadPolicies())),
        switchMap(() => this.store.dispatch(new PaymentAction.ReloadPayments())),
        switchMap(() =>
          this.store.dispatch([new PaymentAction.ReloadHistory(), new PaymentAction.ReloadWallet()])
        ),
        switchMap(() => {
          const sources: Observable<any>[] = [];

          // Fetch the available documents for all policies
          Object.entries(this.autoPayEnrollmentStatusMap).forEach(([policyNumber]) => {
            sources.push(
              this.store.dispatch(new PolicyAction.LoadPolicyDocuments(policyNumber)).pipe(
                tap((_) => {
                  this.availableDocumentsMap[policyNumber] = this.store.selectSnapshot(
                    PolicyState.documentsForPolicy(policyNumber)
                  );
                })
              )
            );
          });

          return concat(...sources);
        }),
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

  private getPayments() {
    return [...this.store.selectSnapshot(PaymentState.upcomingPayments)];
  }

  private makePaymentSuccess(
    policyNumber: string,
    status: string,
    receiptNumber: string,
    paymentAccount: PaymentAccount,
    amount: number
  ) {
    this.paymentResults[policyNumber] = {
      result: status === 'SUCC',
      receiptNumber,
      paymentAccount,
      date: format(new Date(Date.now()), 'yyyy-MM-dd'),
      amount,
    };
  }
}
