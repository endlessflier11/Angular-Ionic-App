import { Component, OnInit } from '@angular/core';
import { noop, Observable } from 'rxjs';
import { PaymentHistory } from '../../_core/interfaces/payment.interface';
import { finalize, switchMap } from 'rxjs/operators';
import { IonRefresher } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { withErrorReporter } from '../../_core/helpers';
import { Policy } from '../../_core/interfaces';
import { RouterService } from '../../_core/services';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { PaymentState } from '../../_core/store/states/payment.state';
import { CustomerAction, PaymentAction, PolicyAction } from '../../_core/store/actions';
import { PolicyState } from '../../_core/store/states/policy.state';

@Component({
  selector: 'app-csaa-payment-history',
  templateUrl: './payment-history.page.html',
  styleUrls: ['./payment-history.page.scss'],
})
export class PaymentHistoryPage implements OnInit {
  currentTheme: string;
  loading = false;
  private refresher: IonRefresher;
  policyNumber: string;
  policy$: Observable<Policy>;
  @Select(PaymentState.paymentHistory) history$: Observable<PaymentHistory>;

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      withErrorReporter((params) => {
        this.policyNumber = params.policyNumber;
        this.initializePage();
      })
    );
  }

  initializePage(): void {
    this.loading = true;
    this.dispatchLoadActions();
    this.policy$ = this.store.select(PolicyState.policyData(this.policyNumber));
  }

  onClickBackBtn() {
    this.routerService.back();
  }

  doRefresh(refresher) {
    this.loading = true;
    this.refresher = refresher;
    this.dispatchReloadActions();
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
