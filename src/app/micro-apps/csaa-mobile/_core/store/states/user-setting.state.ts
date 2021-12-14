import {
  Action,
  getActionTypeFromInstance,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CustomerAction, FetchAction, UserSettingAction } from '../actions';
import { PolicyPaperlessPreference, PolicyPaperlessPreferencesApiResponse } from '../../interfaces';
import { PolicyService } from '../../services';
import { Observable, of } from 'rxjs';
import { FetchState } from './fetch.state';
import { onceTruthy } from '../../operators';
import { switchMap, tap } from 'rxjs/operators';
import { CustomerSelector } from '../selectors';
import { CustomerStateModel } from './state.interfaces';
import { trackRequest } from '../../operators/track-request.operator';

export interface UserSettingsStateModel {
  paperlessPreferences: PolicyPaperlessPreference[];
}

export const USER_SETTING_STATE_TOKEN = 'csaa_user_setting';

const getInitialState = (): UserSettingsStateModel => ({
  paperlessPreferences: null,
});

@State<UserSettingsStateModel>({
  name: USER_SETTING_STATE_TOKEN,
  defaults: {
    ...getInitialState(),
  },
})
@Injectable()
export class UserSettingsState {
  constructor(private readonly store: Store, private readonly policyService: PolicyService) {}

  @Selector()
  static paperlessPreferences(
    state: UserSettingsStateModel
  ): PolicyPaperlessPreferencesApiResponse {
    return state.paperlessPreferences;
  }

  @Action(UserSettingAction.LoadPolicyPaperlessPreferences)
  loadPolicyPaperlessPreferences({
    getState,
    patchState,
  }: StateContext<UserSettingsStateModel>): Observable<unknown> {
    if (
      this.store.selectSnapshot(
        FetchState.succeeded(UserSettingAction.LoadPolicyPaperlessPreferences)
      )
    ) {
      return of(getState().paperlessPreferences);
    }
    return this.store.select(FetchState.succeeded(CustomerAction.LoadCustomer)).pipe(
      onceTruthy(),
      switchMap(() => this.store.selectOnce(CustomerSelector.state)),
      switchMap(({ data: customer }: CustomerStateModel) =>
        this.policyService
          .fetchPaperlessPreferences(customer)
          .pipe(tap((paperlessPreferences) => patchState({ paperlessPreferences })))
      ),
      trackRequest(UserSettingAction.LoadPolicyPaperlessPreferences)
    );
  }

  @Action(UserSettingAction.ReloadPolicyPaperlessPreferences)
  reloadPolicyPaperlessPreferences({
    dispatch,
    patchState,
  }: StateContext<UserSettingsStateModel>): Observable<unknown> {
    return dispatch(
      new FetchAction.Reset(
        getActionTypeFromInstance(UserSettingAction.LoadPolicyPaperlessPreferences)
      )
    ).pipe(
      tap(() => patchState({ paperlessPreferences: getInitialState().paperlessPreferences })),
      switchMap(() => dispatch(new UserSettingAction.LoadPolicyPaperlessPreferences()))
    );
  }

  @Action(UserSettingAction.Reset)
  reset({ patchState }: StateContext<UserSettingsStateModel>) {
    patchState(getInitialState());
    return this.store.dispatch(
      new FetchAction.Reset(
        getActionTypeFromInstance(UserSettingAction.LoadPolicyPaperlessPreferences)
      )
    );
  }
}
