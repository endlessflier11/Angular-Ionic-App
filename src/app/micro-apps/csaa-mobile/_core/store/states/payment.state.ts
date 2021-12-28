import {
  Action,
  createSelector,
  getActionTypeFromInstance,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { PaymentStateModel, PAYMENT_STATE_TOKEN } from './state.interfaces';
import { PaymentAction } from '../actions/payment.actions';
import { PolicyState } from './policy.state';
import { onceTruthy } from '../../operators';
import { FetchState } from './fetch.state';
import { FetchAction, PolicyAction } from '../actions';
import { switchMap, tap } from 'rxjs/operators';
import { trackRequest } from '../../operators/track-request.operator';
import {
  Bill,
  PaymentAccount,
  PaymentHistory,
  PaymentType,
  UpcomingPayment,
  WalletDetails,
} from '../../interfaces';
import { Observable, of } from 'rxjs';
import { CustomerSelector } from '../selectors';

const getInitialState = (): PaymentStateModel => ({
  payments: [],
  wallet: { paymentAccounts: [] },
  history: {},
  bills: {},
});

@State({
  name: PAYMENT_STATE_TOKEN,
  defaults: getInitialState(),
})
@Injectable()
export class PaymentState {
  @Selector()
  static upcomingPayments({ payments }: PaymentStateModel): UpcomingPayment[] {
    return payments;
  }

  @Selector()
  static upcomingPaymentsDue({ payments }: PaymentStateModel): UpcomingPayment[] {
    return payments.filter((payment) => payment.isPaymentDue);
  }

  @Selector()
  static upcomingPaymentsPastDue({ payments }: PaymentStateModel): UpcomingPayment[] {
    return payments.filter((payment) => payment.isPastDue);
  }

  static upcomingPaymentForPolicy(policyNumber: string) {
    return createSelector(
      [PaymentState],
      ({ payments }: PaymentStateModel): UpcomingPayment =>
        payments.find((payment) => payment.policyNumber === policyNumber)
    );
  }

  @Selector()
  static paymentHistory({ history }: PaymentStateModel): PaymentHistory {
    return history;
  }

  @Selector()
  static latestBills({ bills }: PaymentStateModel): Bill[] {
    const policies = Object.keys(bills || {});
    policies.sort();
    return policies
      .map((p) => bills[p])
      .filter((b) => !!b && b.length > 0)
      .map((b) => b[0])
      .filter((b) => b.paymentPlan !== 'mortgageeHO');
  }

  @Selector()
  static walletDetails({ wallet }: PaymentStateModel): WalletDetails {
    return wallet;
  }

  @Selector()
  static preferredPaymentAccount({ wallet }: PaymentStateModel): PaymentAccount {
    if (wallet && wallet.paymentAccounts && wallet.paymentAccounts.length > 0) {
      return wallet.paymentAccounts.find((p) => p.isPreferred);
    }
    return null;
  }

  static paymentMethod(paymentAccountToken: string) {
    return createSelector(
      [PaymentState],
      ({ wallet }: PaymentStateModel): PaymentAccount =>
        wallet?.paymentAccounts?.find((a) => a.paymentAccountToken === paymentAccountToken)
    );
  }

  constructor(private readonly paymentService: PaymentService, private readonly store: Store) {}

  @Action(PaymentAction.Reset)
  reset({ patchState }: StateContext<PaymentStateModel>) {
    patchState(getInitialState());
    return this.store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadPayments)),
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadHistory)),
    ]);
  }

  @Action(PaymentAction.LoadPayments)
  loadPayments({ patchState, getState }: StateContext<PaymentStateModel>): Observable<any> {
    if (this.store.selectSnapshot(FetchState.succeeded(PaymentAction.LoadPayments))) {
      const { payments } = getState();
      return of(payments);
    }

    return this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)).pipe(
      onceTruthy(),
      switchMap(() => {
        const { policies } = this.store.selectSnapshot(PolicyState);
        return this.paymentService
          .fetchBillingSummary(policies)
          .pipe(tap((payments: UpcomingPayment[]) => patchState({ payments })));
      }),
      trackRequest(PaymentAction.LoadPayments)
    );
  }

  @Action(PaymentAction.ReloadPayments)
  reloadPayments({ dispatch, patchState }: StateContext<PaymentStateModel>): Observable<any> {
    const { payments } = getInitialState();
    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadPayments))
    ).pipe(
      tap(() => patchState({ payments })),
      switchMap(() => dispatch(new PaymentAction.LoadPayments()))
    );
  }

  @Action(PaymentAction.LoadHistory)
  loadHistory({ patchState, getState }: StateContext<PaymentStateModel>): Observable<any> {
    if (this.store.selectSnapshot(FetchState.succeeded(PaymentAction.LoadHistory))) {
      const { history } = getState();
      return of(history);
    }
    return this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)).pipe(
      onceTruthy(),
      switchMap(() => {
        const { policies } = this.store.selectSnapshot(PolicyState);
        return this.paymentService
          .fetchPaymentHistory(policies)
          .pipe(tap(({ history, bills }) => patchState({ history, bills })));
      }),
      trackRequest(PaymentAction.LoadHistory)
    );
  }

  @Action(PaymentAction.ReloadHistory)
  reloadHistory({ dispatch, patchState }: StateContext<PaymentStateModel>): Observable<any> {
    const { history } = getInitialState();

    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadHistory))
    ).pipe(
      tap(() => patchState({ history })),
      switchMap(() => dispatch(new PaymentAction.LoadHistory()))
    );
  }

  @Action(PaymentAction.LoadWallet)
  loadWallet({ patchState, getState }: StateContext<PaymentStateModel>): Observable<any> {
    if (this.store.selectSnapshot(FetchState.succeeded(PaymentAction.LoadWallet))) {
      const { wallet } = getState();
      return of(wallet);
    }

    return this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)).pipe(
      onceTruthy(),
      switchMap(() => {
        const { data: customer } = this.store.selectSnapshot(CustomerSelector.state);
        const registrationId = customer?.registrations?.find(
          (r) => r.registrationId
        )?.registrationId;
        return this.paymentService.fetchWalletDetails(registrationId).pipe(
          tap((wallet: WalletDetails) => {
            patchState({ wallet });
          })
        );
      }),
      trackRequest(PaymentAction.LoadWallet)
    );
  }

  @Action(PaymentAction.ReloadWallet)
  reloadWallet({ dispatch, patchState }: StateContext<PaymentStateModel>): Observable<any> {
    const { wallet } = getInitialState();
    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadWallet))
    ).pipe(
      tap(() => patchState({ wallet })),
      switchMap(() => dispatch(new PaymentAction.LoadWallet()))
    );
  }

  @Action(PaymentAction.UpdateAutoPay)
  updateAutoPay(
    { patchState, getState }: StateContext<PaymentStateModel>,
    { policyNumber, isActive }: PaymentAction.UpdateAutoPay
  ) {
    const { payments: currentPayments } = getState();
    const payments = currentPayments.map((p) => {
      let payment = p;
      if (p.policyNumber === policyNumber) {
        payment = { ...p };
        payment.autoPay = isActive;
        payment.autopayEnrollment = isActive ? p.autopayEnrollment : null;
      }
      return payment;
    });
    patchState({ payments });
  }

  @Action(PaymentAction.UpdatePaymentTypeAmount)
  updatePaymentTypeAmount(
    { patchState, getState }: StateContext<PaymentStateModel>,
    { policyNumber, type, otherAmount }: PaymentAction.UpdatePaymentTypeAmount
  ) {
    const { payments: currentPayments } = getState();
    const payments = currentPayments.map((p) => {
      const payment = { ...p };
      payment.type = type;
      payment.otherAmount = null;
      payment.amount =
        type === PaymentType.remaining ? payment.remainingPremium : payment.minimumAmount;
      if (p.policyNumber === policyNumber && type === PaymentType.other) {
        payment.otherAmount = otherAmount;
      }
      return payment;
    });
    patchState({ payments });
  }
}
