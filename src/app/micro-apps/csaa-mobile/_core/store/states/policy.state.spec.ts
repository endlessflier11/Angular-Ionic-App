import { TestBed } from '@angular/core/testing';
import { getActionTypeFromInstance, NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import {
  CUSTOMER_STATE_FIXTURE_MOCK,
  DOCUMENTS_FIXTURE,
  PageTestingModule,
  PoliciesResponseMock,
  setCustomerPolicies,
  setPolicyDocuments,
  StoreTestBuilder,
} from '@app/testing';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { FetchAction, PolicyAction } from '../actions';
import { PolicyState } from './policy.state';
import { HttpTestingController } from '@angular/common/http/testing';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { AppEndpointsEnum } from '../../interfaces';

const flushMockResponses = (httpTestingController: HttpTestingController, policies) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.policies])
    .forEach((req) => req.flush(policies));
};

const flushMockDocuments = (httpTestingController: HttpTestingController, policyDocuments) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.policyDocuments])
    .forEach((req) => req.flush(policyDocuments));
};

describe('CsaaPolicyState', function () {
  let store: Store;
  let httpTestingController: HttpTestingController;
  let MOCKED_POLICIES;
  let INITIAL_POLICES;
  let POLICY_NUMBER;

  beforeEach(() => {
    MOCKED_POLICIES = PoliciesResponseMock.create().toJson();
    INITIAL_POLICES = CUSTOMER_STATE_FIXTURE_MOCK.csaa_policies.policies;
    POLICY_NUMBER = INITIAL_POLICES[0].number;
    TestBed.configureTestingModule({
      imports: [
        CsaaCoreModule.forRoot(),
        NgxsModule.forRoot([AppState]),
        PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
      ],
    });

    CsaaAppInjector.injector = TestBed.inject(Injector);
    store = TestBed.inject(Store);
    httpTestingController = TestBed.inject(HttpTestingController);
    StoreTestBuilder.withDefaultMocks()
      .withCustomerState(
        setCustomerPolicies(
          setPolicyDocuments(CUSTOMER_STATE_FIXTURE_MOCK, DOCUMENTS_FIXTURE, POLICY_NUMBER),
          MOCKED_POLICIES
        )
      )
      .resetStateOf(store);
  });

  it('should discard state and load the policy data from backend', function () {
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadPolicies)),
      new PolicyAction.LoadPolicies(),
    ]);
    let policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(INITIAL_POLICES.length);
    flushMockResponses(httpTestingController, MOCKED_POLICIES);
    policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(4);
  });

  it('should return the policy state from previous loaded data', function () {
    store.dispatch([new PolicyAction.LoadPolicies()]);
    const calls = httpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.policies]);
    expect(calls).toHaveLength(0);
    const policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(INITIAL_POLICES.length);
  });

  it('should reset the load policies from the policy state', function () {
    store.dispatch([new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadPolicies))]);
    let policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(INITIAL_POLICES.length);
    flushMockResponses(httpTestingController, MOCKED_POLICIES);
    policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(3);
  });

  it('should discard state and reload the policy data from backend', function () {
    let policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(INITIAL_POLICES.length);
    store.dispatch([new PolicyAction.ReloadPolicies()]);
    policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(0);
    flushMockResponses(httpTestingController, MOCKED_POLICIES);
    policies = store.selectSnapshot(PolicyState).policies;
    expect(policies).toHaveLength(4);
  });

  it('should load policy documents data from backend', function () {
    let policyDocuments = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER));
    expect(policyDocuments).toHaveLength(DOCUMENTS_FIXTURE.length);
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(PolicyAction.LoadPolicyDocuments)),
      new PolicyAction.LoadPolicyDocuments(POLICY_NUMBER),
    ]);
    policyDocuments = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER));
    expect(policyDocuments).toHaveLength(0);
    flushMockDocuments(httpTestingController, DOCUMENTS_FIXTURE);
    policyDocuments = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER));
    expect(policyDocuments).toHaveLength(DOCUMENTS_FIXTURE.length);
  });

  it('should reload policy documents data from the backend', function () {
    let policyDocuments = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER));
    expect(policyDocuments).toHaveLength(DOCUMENTS_FIXTURE.length);
    store.dispatch([new PolicyAction.ReloadPolicyDocuments(POLICY_NUMBER)]);
    policyDocuments = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER));
    expect(policyDocuments).toHaveLength(0);
    flushMockDocuments(httpTestingController, DOCUMENTS_FIXTURE);
    policyDocuments = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER));
    expect(policyDocuments).toHaveLength(DOCUMENTS_FIXTURE.length);
  });
});
