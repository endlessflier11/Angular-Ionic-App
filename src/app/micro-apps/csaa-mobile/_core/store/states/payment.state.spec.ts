import { TestBed } from '@angular/core/testing';
import { getActionTypeFromInstance, NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import {
  BillingHistoryResponseMock,
  BillingSummaryResponseMock,
  BILLING_HISTORY_RESPONSE_SINGLE_POLICY,
  deepCopy,
  StoreTestBuilder,
  WalletResponseMock,
  PageTestingModule,
} from '@app/testing';
import { FetchAction, PaymentAction } from '../actions';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { PaymentState } from './payment.state';
import { USER1_STATE_FIXTURES_MOCK } from 'src/testing/fixtures/state/by-user-state.fixture';
import { AppEndpointsEnum } from '../../interfaces';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';

const flushMockResponses = (httpTestingController: HttpTestingController, billingSummary) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
    .forEach((req) => req.flush(billingSummary));
};

const flushHistoryMockresponses = (
  HttpTestingController: HttpTestingController,
  billingHistory
) => {
  HttpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.billingHistory]).forEach((req) =>
    req.flush(billingHistory)
  );
};

const POLICY_NUMBER = 'WYSS910014303';
const OWNER_ID = '02FA1E8C-53A2-49CC-9F64-FEE0DB5FFDA1';
const setUpPolicies = (policies) => {
  return [{ ...policies[0], number: POLICY_NUMBER }];
};

describe('CsaaPaymentState', function () {
  let store: Store;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({
          providesStorage: true,
          providesRouter: true,
          providesMetadata: true,
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

    const customerState = {
      registrations: [
        {
          registrationId: OWNER_ID,
          registrationSource: null,
          startDate: null,
        },
      ],
    };

    CsaaAppInjector.injector = TestBed.inject(Injector);
    store = TestBed.inject(Store);
    httpTestingController = TestBed.inject(HttpTestingController);
    StoreTestBuilder.withDefaultMocks()
      .withPolicyState(policyState)
      .patchCustomerData(customerState)
      .resetStateOf(store);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should discard state and load the payments data from backend', function () {
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadPayments)),
      new PaymentAction.LoadPayments(),
    ]);
    const billingSummary = BillingSummaryResponseMock.create().withPaymentDue().toJson();
    let payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(3);

    flushMockResponses(httpTestingController, billingSummary);
    httpTestingController
      .match((r) => r.url === AppEndpointsEnum[AppEndpointsEnum.billingInstallmentFees])
      .forEach((req) => req.flush({}));
    payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(1);
  });

  it('should return the payments state from previous loaded data', function () {
    store.dispatch([new PaymentAction.LoadPayments()]);
    const calls = httpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.billingPayment]);
    expect(calls).toHaveLength(0);
    const payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(3);
  });

  it('should reset the load payments from the policy state', function () {
    store.dispatch([new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadPayments))]);
    const billingSummary = BillingSummaryResponseMock.create().withPaymentDue().toJson();
    let payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(3);
    flushMockResponses(httpTestingController, billingSummary);
    payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(3);
  });

  it('should discard state and reload the payments data from backend', function () {
    let payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(3);
    store.dispatch([new PaymentAction.ReloadPayments()]);
    const billingSummary = BillingSummaryResponseMock.create().withPaymentDue().toJson();
    payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(0);
    flushMockResponses(httpTestingController, billingSummary);
    httpTestingController
      .match((r) => r.url === AppEndpointsEnum[AppEndpointsEnum.billingInstallmentFees])
      .forEach((req) => req.flush({}));
    payments = store.selectSnapshot(PaymentState).payments;
    expect(payments).toHaveLength(1);
  });

  it('should discard state and load the history data from backend', function () {
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadHistory)),
      new PaymentAction.LoadHistory(),
    ]);
    const response = deepCopy(BILLING_HISTORY_RESPONSE_SINGLE_POLICY);
    response.billingHistoryPoliciesResponse[0].policyNumber = POLICY_NUMBER;
    const billingHistory = BillingHistoryResponseMock.create(response).toJson();
    let history = store.selectSnapshot(PaymentState).history;
    expect(history).toBeTruthy();
    flushHistoryMockresponses(httpTestingController, billingHistory);
    history = store.selectSnapshot(PaymentState).history;
    expect(history).toBeTruthy();
  });

  it('should reset the load history from the policy state', function () {
    store.dispatch([new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadHistory))]);
    const response = deepCopy(BILLING_HISTORY_RESPONSE_SINGLE_POLICY);
    response.billingHistoryPoliciesResponse[0].policyNumber = POLICY_NUMBER;
    const billingHistory = BillingHistoryResponseMock.create(response).toJson();
    let history = store.selectSnapshot(PaymentState).history;
    expect(history).toBeTruthy;

    flushMockResponses(httpTestingController, billingHistory);
    history = store.selectSnapshot(PaymentState).history;
    expect(history).toBeTruthy;
  });

  it('should return the history state from previous loaded data', function () {
    store.dispatch([new PaymentAction.ReloadHistory()]);
    const calls = httpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.billingHistory]);
    expect(calls).toHaveLength(1);
    const payments = store.selectSnapshot(PaymentState).history;
    expect(payments).toBeTruthy();
  });

  it('should discard state and load the wallet data from backend', function () {
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(PaymentAction.LoadWallet)),
      new PaymentAction.LoadWallet(),
    ]);
    const RESPONSE = WalletResponseMock.create().toJson();

    let wallet = store.selectSnapshot(PaymentState).wallet;
    expect(wallet.paymentAccounts).toHaveLength(0);

    httpTestingController.expectOne(`billingWallet?ownerId=${OWNER_ID}`).flush(RESPONSE);
    httpTestingController.verify();

    wallet = store.selectSnapshot(PaymentState).wallet;
    expect(wallet.paymentAccounts).toHaveLength(5);
  });

  it('should return the wallet state from previous loaded data', function () {
    const RESPONSE = WalletResponseMock.create().toJson();
    let wallet = store.selectSnapshot(PaymentState).wallet;
    expect(wallet.paymentAccounts).toHaveLength(0);
    store.dispatch([new PaymentAction.ReloadWallet()]);
    httpTestingController.expectOne(`billingWallet?ownerId=${OWNER_ID}`).flush(RESPONSE);
    httpTestingController.verify();
    wallet = store.selectSnapshot(PaymentState).wallet;
    expect(wallet.paymentAccounts).toHaveLength(5);
  });
});
