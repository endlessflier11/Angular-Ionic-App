import { TestBed } from '@angular/core/testing';
import { getActionTypeFromInstance, NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import { StoreTestBuilder, ClaimsResponseMock, PageTestingModule } from '@app/testing';
import { ClaimAction, FetchAction } from '../actions';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { ClaimState } from './claim.state';
import { USER1_STATE_FIXTURES_MOCK } from 'src/testing/fixtures/state/by-user-state.fixture';
import { AppEndpointsEnum } from '../../interfaces';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';

const flushMockResponses = (httpTestingController: HttpTestingController, claims) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.claims])
    .forEach((req) => req.flush(claims));
};

const POLICY_NUMBER = 'WYSS910014010';
const setUpPolicies = (policies) => {
  return [{ ...policies[0], number: POLICY_NUMBER }];
};

describe('CsaaClaimState', function () {
  let store: Store;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({
          providesStorage: true,
          providesMetadata: true,
          providesRouter: true,
        }),
        CsaaCoreModule.forRoot(),
        CsaaHttpClientModule,
        HttpClientTestingModule,
        NgxsModule.forRoot([AppState]),
      ],
    });

    const policyState = {
      policies: setUpPolicies(USER1_STATE_FIXTURES_MOCK.POLICIES),
      documents: {},
      allowedEndorsements: {},
      activeDocument: null,
    };

    CsaaAppInjector.injector = TestBed.inject(Injector);
    store = TestBed.inject(Store);
    httpTestingController = TestBed.inject(HttpTestingController);
    StoreTestBuilder.withDefaultMocks().withPolicyState(policyState).resetStateOf(store);
  });

  it('should discard state and load the payments data from backend', function () {
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(ClaimAction.LoadClaims)),
      new ClaimAction.LoadClaims(),
    ]);
    const claimsResponse = ClaimsResponseMock.create().toJson();
    let claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(1);
    flushMockResponses(httpTestingController, [claimsResponse[0]]);
    claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(1);
  });

  it('should return the policy state from previous loaded data', function () {
    store.dispatch([new ClaimAction.LoadClaims()]);
    const calls = httpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.claims]);
    expect(calls).toHaveLength(0);
    const claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(1);
  });

  it('should reset the load policies from the policy state', function () {
    store.dispatch([new FetchAction.Reset(getActionTypeFromInstance(ClaimAction.LoadClaims))]);
    const claimsResponse = ClaimsResponseMock.create().toJson();
    let claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(1);
    flushMockResponses(httpTestingController, [claimsResponse[0]]);
    claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(1);
  });

  it('should discard state and reload the payments data from backend', function () {
    let claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(1);
    store.dispatch([new ClaimAction.ReloadClaims()]);
    claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(0);
    const claimsResponse = ClaimsResponseMock.create().toJson();
    flushMockResponses(httpTestingController, [claimsResponse[0], claimsResponse[0]]);
    claims = store.selectSnapshot(ClaimState);
    expect(claims).toHaveLength(2);
  });
});
