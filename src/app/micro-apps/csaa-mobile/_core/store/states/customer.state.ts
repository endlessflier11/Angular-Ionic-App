import {
  Action,
  getActionTypeFromInstance,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import { Injectable } from '@angular/core';

import { CUSTOMER_STATE_TOKEN, CustomerStateModel } from './state.interfaces';
import { CustomerAction, FetchAction, MetadataAction } from '../actions';
import { AuthService, PolicyService } from '../../../_core/services';
import { switchMap, tap } from 'rxjs/operators';
import { trackRequest } from '../../operators/track-request.operator';
import { PolicyState } from './policy.state';
import { PaymentState } from './payment.state';
import { Observable, of } from 'rxjs';
import { FetchState } from './fetch.state';
import { CustomerSearchResponse } from '../../interfaces';
import { ClaimState } from './claim.state';

export const CUSTOMER_CHILD_STATES = [PolicyState, PaymentState, ClaimState];

const getInitialState = (): CustomerStateModel => ({
  data: null,
});

@State<CustomerStateModel>({
  name: CUSTOMER_STATE_TOKEN,
  defaults: getInitialState(),
  children: CUSTOMER_CHILD_STATES,
})
@Injectable()
export class CustomerState {
  constructor(
    private readonly authService: AuthService,
    private readonly policyService: PolicyService,
    private readonly store: Store
  ) {}

  @Selector()
  public static isLoaded(state: CustomerStateModel): boolean {
    return !!state.data;
  }

  @Selector()
  public static customerData({ data }: CustomerStateModel): CustomerSearchResponse {
    return data;
  }

  @Selector()
  public static hasRegistrationId({ data }: CustomerStateModel): boolean {
    return (
      data?.registrations?.length > 0 &&
      data.registrations.filter((reg) => !!reg.registrationId).length > 0
    );
  }

  @Selector()
  public static registrationId({ data }: CustomerStateModel): string {
    return data?.registrations?.find((reg) => reg.registrationId)?.registrationId;
  }

  @Selector()
  public static hasPendingEnrollment({ data }: CustomerStateModel): boolean {
    return !!data?.isPaperlessEnrollmentPending;
  }

  @Action(CustomerAction.LoadCustomer)
  loadCustomer({
    dispatch,
    patchState,
    getState,
  }: StateContext<CustomerStateModel>): Observable<any> {
    if (this.store.selectSnapshot(FetchState.succeeded(CustomerAction.LoadCustomer))) {
      return of(getState());
    }
    return this.authService.fetchAuthenticatedCustomer().pipe(
      tap((data) => {
        patchState({ data });
        // TODO: Refactor SharedService state and store registration ID
        // if (res.registrations[0]) {
        //   this.sharedService.setRegistrationId(res.registrations[0].registrationId);
        // }
        dispatch(
          new MetadataAction.SetProperties({
            mdmId: data.mdmId,
            mdm_email: data.email,
          })
        );
      }),
      // We want to keep this as last operator to avoid race conditions when listening for success status
      trackRequest(CustomerAction.LoadCustomer)
    );
  }

  @Action(CustomerAction.Reset)
  reset({ patchState }: StateContext<CustomerStateModel>) {
    patchState(getInitialState());
    return this.store.dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(CustomerAction.LoadCustomer))
    );
  }

  @Action(CustomerAction.ReloadCustomer)
  reloadCustomer({ dispatch, patchState }: StateContext<CustomerStateModel>): Observable<any> {
    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(CustomerAction.LoadCustomer))
    ).pipe(
      tap(() => patchState(getInitialState())),
      switchMap(() => dispatch(new CustomerAction.LoadCustomer()))
    );
  }

  @Action(CustomerAction.AcceptPaperlessTerms)
  acceptPaperlessTerms({ dispatch, getState }: StateContext<CustomerStateModel>): Observable<any> {
    return this.policyService
      .acceptPaperlessEnrollmentTerms(getState().data)
      .pipe(switchMap(() => dispatch(new CustomerAction.ReloadCustomer())));
  }
}
