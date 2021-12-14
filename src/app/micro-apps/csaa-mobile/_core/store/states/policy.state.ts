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
import { Policy, PolicyStatus, PolicyType } from '../../interfaces';
import { CustomerAction, FetchAction, PolicyAction } from '../actions';
import { switchMap, tap } from 'rxjs/operators';
import { trackRequest } from '../../operators/track-request.operator';
import { CustomerStateModel, POLICY_STATE_TOKEN, PolicyStateModel } from './state.interfaces';
import { FetchState } from './fetch.state';
import { Observable, of } from 'rxjs';
import { onceTruthy } from '../../operators';
import { CustomerSelector } from '../selectors';
import { PolicyDocument } from '../../interfaces/document.interface';
import { PolicyService } from '../../services/policy.service';
import { PolicyHelper } from '../../shared/policy.helper';

const getInitialState = (): PolicyStateModel => ({
  policies: [],
  documents: {},
  allowedEndorsements: {},
  activeDocument: null,
});

@State<PolicyStateModel>({
  name: POLICY_STATE_TOKEN,
  defaults: getInitialState(),
})
@Injectable()
export class PolicyState {
  constructor(private readonly store: Store, private readonly policyService: PolicyService) {}

  @Selector()
  static allPolicies({ policies }: PolicyStateModel): Policy[] {
    return policies;
  }

  @Selector()
  static activePolicies({ policies }: PolicyStateModel): Policy[] {
    return policies.filter((p) => p.status === PolicyStatus.ACTIVE);
  }

  @Selector()
  static gracePeriodPolicies({ policies }: PolicyStateModel): Policy[] {
    return policies.filter((p) => p.gracePeriod);
  }

  @Selector()
  static cancelledPolicies({ policies }: PolicyStateModel): Policy[] {
    return policies.filter((p) => p.status === PolicyStatus.CANCELLED && p.gracePeriod);
  }

  @Selector()
  static hasAutoPolicy({ policies }: PolicyStateModel): boolean {
    return policies
      .filter((p) => p.status === PolicyStatus.ACTIVE)
      .some((p) => p.type === PolicyType.Auto);
  }

  @Selector()
  static isMonolineAutoPolicies({ policies }: PolicyStateModel): boolean {
    return !policies.some(
      (p) => ![PolicyType.Auto, PolicyType.PUP].includes(p.type) && p.status === PolicyStatus.ACTIVE
    );
  }

  @Selector()
  static isMonolinePropertyPolicies({ policies }: PolicyStateModel): boolean {
    return !policies.some(
      (p) => ![PolicyType.Home, PolicyType.PUP].includes(p.type) && p.status === PolicyStatus.ACTIVE
    );
  }

  static policyData(policyNumber: string) {
    return createSelector(
      [PolicyState],
      ({ policies }: PolicyStateModel): Policy => policies.find((p) => p.number === policyNumber)
    );
  }

  static documentsForPolicy(policyNumber: string) {
    return createSelector(
      [PolicyState],
      ({ documents }: PolicyStateModel): PolicyDocument[] => documents[policyNumber] || []
    );
  }

  static allowedEndorsements(policyNumber: string) {
    return createSelector(
      [PolicyState],
      ({ allowedEndorsements }: PolicyStateModel): string[] => allowedEndorsements[policyNumber]
    );
  }

  @Selector()
  static activeDocument({ activeDocument }: PolicyStateModel): PolicyDocument {
    return activeDocument;
  }

  @Selector()
  static activeDocumentUri({ activeDocument }: PolicyStateModel): string {
    return activeDocument?.externalURI;
  }

  @Action(PolicyAction.Reset)
  reset({ setState }: StateContext<PolicyStateModel>) {
    setState(getInitialState());
    return this.store.dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadPolicies))
    );
  }

  @Action(PolicyAction.LoadPolicies)
  loadPolicies({ setState, getState }: StateContext<PolicyStateModel>): Observable<any> {
    if (this.store.selectSnapshot(FetchState.succeeded(PolicyAction.LoadPolicies))) {
      return of(getState());
    }
    return this.store.select(FetchState.succeeded(CustomerAction.LoadCustomer)).pipe(
      onceTruthy(),
      switchMap(() => this.store.selectOnce(CustomerSelector.state)),
      switchMap(({ data: customer }: CustomerStateModel) =>
        this.policyService
          .loadData(customer)
          .pipe(tap((policies: Policy[]) => setState({ ...getInitialState(), policies })))
      ),
      // We want to keep this as last operator to avoid race conditions when listening for success status
      trackRequest(PolicyAction.LoadPolicies)
    );
  }

  @Action(PolicyAction.ReloadPolicies)
  ReloadPolicies({ setState, dispatch }: StateContext<PolicyStateModel>): Observable<any> {
    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadPolicies))
    ).pipe(
      tap(() => setState(getInitialState())),
      switchMap(() => dispatch(new PolicyAction.LoadPolicies()))
    );
  }

  @Action(PolicyAction.LoadPolicyDocuments)
  loadPolicyDocuments(
    { patchState, getState }: StateContext<PolicyStateModel>,
    { policyNumber }: PolicyAction.LoadPolicyDocuments
  ) {
    const currentState = { ...getState().documents };
    if (
      this.store.selectSnapshot(FetchState.succeeded(PolicyAction.LoadPolicyDocuments)) &&
      !!currentState[policyNumber]
    ) {
      return of(getState());
    }
    currentState[policyNumber] = null;
    patchState({ documents: currentState, activeDocument: null });
    return this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)).pipe(
      onceTruthy(),
      switchMap(() => {
        const { type } = this.store.selectSnapshot(PolicyState.policyData(policyNumber));
        return this.policyService.getDocumentsForPolicy(policyNumber, type);
      }),
      tap((documents: PolicyDocument[]) => {
        const nextState = { ...getState().documents };
        nextState[policyNumber] = documents;
        patchState({ documents: nextState });
      }),
      trackRequest(PolicyAction.LoadPolicyDocuments)
    );
  }

  @Action(PolicyAction.ReloadPolicyDocuments)
  reloadPolicyDocuments(
    { dispatch }: StateContext<PolicyStateModel>,
    { policyNumber }: PolicyAction.ReloadPolicyDocuments
  ) {
    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadPolicyDocuments))
    ).pipe(switchMap(() => dispatch(new PolicyAction.LoadPolicyDocuments(policyNumber))));
  }

  @Action(PolicyAction.LoadAllowedEndorsements)
  loadAllowedEndorsements(
    { patchState, getState }: StateContext<PolicyStateModel>,
    { policyNumber }: PolicyAction.LoadAllowedEndorsements
  ) {
    const currentState = { ...getState().allowedEndorsements };
    if (
      this.store.selectSnapshot(FetchState.succeeded(PolicyAction.LoadAllowedEndorsements)) &&
      !!currentState[policyNumber]
    ) {
      return of(getState());
    }
    currentState[policyNumber] = null;
    patchState({ allowedEndorsements: currentState });

    return this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)).pipe(
      onceTruthy(),
      switchMap(() => {
        const { riskState, type } = this.store.selectSnapshot(PolicyState.policyData(policyNumber));

        return this.policyService.getAllowedEndorsements(
          policyNumber,
          PolicyHelper.typeCodeFromEnum(type),
          riskState
        );
      }),
      tap((endorsements) => {
        const nextState = { ...getState().allowedEndorsements };
        nextState[policyNumber] = endorsements;
        patchState({ allowedEndorsements: nextState });
      }),
      trackRequest(PolicyAction.LoadAllowedEndorsements)
    );
  }

  @Action(PolicyAction.ReloadAllowedEndorsements)
  reloadAllowedEndorsements(
    { dispatch }: StateContext<PolicyStateModel>,
    { policyNumber }: PolicyAction.ReloadAllowedEndorsements
  ) {
    return dispatch(
      new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadAllowedEndorsements))
    ).pipe(switchMap(() => dispatch(new PolicyAction.LoadAllowedEndorsements(policyNumber))));
  }

  @Action(PolicyAction.RefreshActiveDocument)
  refreshActiveDocument(
    { patchState }: StateContext<PolicyStateModel>,
    { policyNumber, activeDocument }: PolicyAction.RefreshActiveDocument
  ) {
    patchState({ activeDocument: { ...activeDocument, externalURI: null } });
    const { type } = this.store.selectSnapshot(PolicyState.policyData(policyNumber));
    return this.policyService.getDocumentByOid(policyNumber, type, activeDocument.oid).pipe(
      tap((document: PolicyDocument) => {
        if (!document || document.oid !== activeDocument.oid) {
          throw new Error(
            `Document for policy ${policyNumber} not found : oid ${activeDocument.oid}`
          );
        }
        patchState({ activeDocument: { ...activeDocument, externalURI: document?.externalURI } });
      }),
      trackRequest(PolicyAction.RefreshActiveDocument)
    );
  }

  @Action(PolicyAction.ClearActiveDocument)
  clearActiveDocument({ patchState }: StateContext<PolicyStateModel>) {
    patchState({ activeDocument: null });
  }
}
