import { TestBed } from '@angular/core/testing';
import { getActionTypeFromInstance, NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import { StoreTestBuilder, CustomerResponseMock, PageTestingModule } from '@app/testing';
import { CustomerAction, FetchAction } from '../actions';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { CustomerState } from './customer.state';
import { AppEndpointsEnum } from '../../interfaces';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';

const flushMockResponses = (httpTestingController: HttpTestingController, customer) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
    .forEach((req) => req.flush(customer));
};

describe('CsaaCustomerState', function () {
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

    CsaaAppInjector.injector = TestBed.inject(Injector);
    store = TestBed.inject(Store);
    httpTestingController = TestBed.inject(HttpTestingController);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
  });

  it('should discard state and load the payments data from backend', function () {
    store.dispatch([
      new FetchAction.Reset(getActionTypeFromInstance(CustomerAction.LoadCustomer)),
      new CustomerAction.LoadCustomer(),
    ]);
    const customerSummary = CustomerResponseMock.create().toJson();
    let customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
    flushMockResponses(httpTestingController, customerSummary);
    customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
  });

  it('should return the policy state from previous loaded data', function () {
    store.dispatch([new CustomerAction.LoadCustomer()]);
    const calls = httpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.customerSearch]);
    expect(calls).toBeTruthy();
    const customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
  });

  it('should reset the load policies from the policy state', function () {
    store.dispatch([new FetchAction.Reset(getActionTypeFromInstance(CustomerAction.LoadCustomer))]);
    const customerSummary = CustomerResponseMock.create().toJson();
    let customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
    flushMockResponses(httpTestingController, customerSummary);
    customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
  });

  it('should discard state and reload the payments data from backend', function () {
    let customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
    store.dispatch([new CustomerAction.ReloadCustomer()]);
    customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeFalsy();
    const customerSummary = CustomerResponseMock.create().toJson();
    flushMockResponses(httpTestingController, customerSummary);
    customer = store.selectSnapshot(CustomerState);
    expect(customer.data).toBeTruthy();
  });
});
