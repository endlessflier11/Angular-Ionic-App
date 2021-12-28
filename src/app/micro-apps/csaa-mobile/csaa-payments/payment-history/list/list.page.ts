import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../../_core/store/states/config.state';
import { RouterService, PdfDisplayService, AnalyticsService } from '../../../_core/services';
import {
  PaymentHistory,
  Policy,
  AutoPayEnrollmentResponse,
  Bill,
  Category,
  EventName,
  EventType,
  UpcomingPayment,
} from '../../../_core/interfaces';
import { PaymentState } from '../../../_core/store/states/payment.state';
import { noop, Observable, concat } from 'rxjs';
import { PolicyState } from '../../../_core/store/states/policy.state';
import { SubSink } from '../../../_core/shared/subscription.helper';
import { CustomerAction, PaymentAction, PolicyAction } from '../../../_core/store/actions';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { withErrorReporter, fetchHasFailedFor } from '../../../_core/helpers';
import { interactWithLoader } from '../../../_core/operators';
import { IonRefresher } from '@ionic/angular';
import { PolicyDocument } from '../../../_core/interfaces/document.interface';
import { FetchState } from '../../../_core/store/states/fetch.state';

@Component({
  selector: 'app-csaa-payment-history-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class PaymentHistoryListPage implements OnInit, OnDestroy {
  @Select(PaymentState.paymentHistory) history$: Observable<PaymentHistory>;
  @Select(PolicyState.allPolicies) policies$: Observable<Policy[]>;
  @Select(PaymentState.upcomingPayments) payments$: Observable<UpcomingPayment[]>;
  @Select(PaymentState.latestBills) latestBills$: Observable<Bill[]>;
  @Select(FetchState.isLoading(PaymentAction.LoadPayments)) isPaymentsLoading$: Observable<boolean>;

  currentTheme: string;
  loading = false;

  // Special props for displaying bills
  autoPayEnrollmentStatusMap: { [policyNumber: string]: AutoPayEnrollmentResponse | null } = {};
  isPaidInFullStatusMap: { [policyNumber: string]: boolean } = {};
  availableDocumentsMap: { [policyNumber: string]: PolicyDocument[] } = {};

  private refresher: IonRefresher;
  private readonly subsink = new SubSink();

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly analyticsService: AnalyticsService,
    private readonly pdfDisplayService: PdfDisplayService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  ngOnInit(): void {
    this.loading = true;
    this.subsink.add(
      fetchHasFailedFor(
        this.store,
        CustomerAction.LoadCustomer,
        PolicyAction.LoadPolicies
      ).subscribe(() => this.routerService.navigateRoot()),
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
    this.dispatchLoadActions();
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }

  invalidDateAndnoRemainder(payment: UpcomingPayment) {
    const today = new Date(Date.now());
    const dueDate = new Date(payment.dueDate);
    const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / 1000 / 3600 / 24);

    const month = dueDate.getMonth() + 1;
    const year = dueDate.getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    return payment.remainingPremium <= 0 && diffDays >= daysInMonth;
  }

  onClickBackBtn() {
    this.routerService.back();
  }

  renderSinglePolicyHistoryCard(_history: PaymentHistory, policies: Policy[]) {
    return policies?.length === 1;
  }

  openPaymentHistory(policy) {
    this.routerService
      .navigateForward('csaa.payment.history.policy', { policyNumber: policy.number })
      .then(noop);
  }

  doRefresh(refresher) {
    this.loading = true;
    this.refresher = refresher;
    this.dispatchReloadActions();
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

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
    }
  }

  private dispatchLoadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() => this.store.dispatch(new PaymentAction.LoadPayments())),
        switchMap(() => this.store.dispatch(new PaymentAction.LoadHistory())),
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

  private dispatchReloadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.ReloadPolicies())),
        switchMap(() => this.store.dispatch(new PaymentAction.ReloadPayments())),
        switchMap(() => this.store.dispatch(new PaymentAction.ReloadHistory())),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter(noop));
  }
}
