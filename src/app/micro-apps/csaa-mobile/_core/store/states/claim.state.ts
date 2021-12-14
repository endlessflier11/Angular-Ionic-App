import {
  Action,
  createSelector,
  getActionTypeFromInstance,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { FetchAction, ClaimAction, PolicyAction } from '../actions';
import { switchMap, tap } from 'rxjs/operators';
import { trackRequest } from '../../operators/track-request.operator';
import { ClaimStateModel, CLAIM_STATE_TOKEN } from './state.interfaces';
import { FetchState } from './fetch.state';
import { Observable, of } from 'rxjs';
import { onceTruthy } from '../../operators';
import { ClaimService } from '../../services/claim.service';
import { PolicyState } from './policy.state';
import { Claim } from '../../interfaces/claim.interface';

const getInitialState = (): ClaimStateModel => [];

@State<ClaimStateModel>({
  name: CLAIM_STATE_TOKEN,
  defaults: getInitialState(),
})
@Injectable()
export class ClaimState {
  static claimData(claimNumber: string) {
    return createSelector(
      [ClaimState],
      (claims: ClaimStateModel): Claim => claims?.find((c) => c.number === claimNumber)
    );
  }

  constructor(private readonly store: Store, private readonly claimService: ClaimService) {}

  @Action(ClaimAction.Reset)
  reset({ setState }: StateContext<ClaimStateModel>) {
    setState(getInitialState());
    return this.store.dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(ClaimAction.LoadClaims))
    );
  }

  @Action(ClaimAction.LoadClaims)
  loadClaims({ setState, getState }: StateContext<ClaimStateModel>): Observable<any> {
    if (this.store.selectSnapshot(FetchState.succeeded(ClaimAction.LoadClaims))) {
      return of(getState());
    }

    return this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)).pipe(
      onceTruthy(),
      switchMap(() => {
        const { policies } = this.store.selectSnapshot(PolicyState);
        return this.claimService
          .fetchClaims(policies)
          .pipe(tap((claims: Claim[]) => setState(claims)));
      }),
      trackRequest(ClaimAction.LoadClaims)
    );
  }

  @Action(ClaimAction.ReloadClaims)
  reloadClaims({ dispatch, setState }: StateContext<ClaimStateModel>): Observable<any> {
    const claims = getInitialState();
    return dispatch(new FetchAction.Reset(getActionTypeFromInstance(ClaimAction.LoadClaims))).pipe(
      tap(() => setState(claims)),
      switchMap(() => dispatch(new ClaimAction.LoadClaims()))
    );
  }
}
