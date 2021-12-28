import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  By,
  CUSTOMER_STATE_FIXTURE_MOCK,
  DOCUMENTS_FIXTURE,
  PageTestingModule,
  setPolicyDocuments,
  StoreTestBuilder,
} from '@app/testing';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../../_shared/ui-kits/csaa-payments-ui-kits.module';
import { CallService } from '../../../_core/services/call.service';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsaaHttpClientModule } from '../../../_core/csaa-http-client.module';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { Store } from '@ngxs/store';
import { Platform } from '@ionic/angular';
import { PaymentHistoryListPage } from './list.page';
import { USER1_STATE_FIXTURES_MOCK } from '../../../../../../testing/fixtures/state/by-user-state.fixture';
import { AppEndpointsEnum } from '../../../_core/interfaces';

const flushMockDocuments = (httpTestingController: HttpTestingController, policyDocuments) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.policyDocuments])
    .forEach((req) => req.flush(policyDocuments));
};

describe('PaymentHistoryListPage', () => {
  let fixture: ComponentFixture<PaymentHistoryListPage>;
  let httpTestingController: HttpTestingController;
  let INITIAL_POLICES;
  let CUSTOMER;

  beforeEach(async () => {
    INITIAL_POLICES = CUSTOMER_STATE_FIXTURE_MOCK.csaa_policies.policies;
    CUSTOMER = INITIAL_POLICES.reduce(
      (customer, p) => setPolicyDocuments(customer, DOCUMENTS_FIXTURE, p.number),
      CUSTOMER_STATE_FIXTURE_MOCK
    );

    try {
      await TestBed.configureTestingModule({
        declarations: [PaymentHistoryListPage],
        imports: [
          PageTestingModule.withConfig({
            providesAnalytics: true,
            providesConfig: true,
            providesStorage: true,
          }),
          UiKitsModule,
          CsaaPaymentsUiKitsModule,
          CsaaCoreModule.forRoot(),
        ],
        providers: [
          HttpClientTestingModule,
          CsaaHttpClientModule,
          { provide: CallService, useValue: { call: jest.fn() } },
        ],
      }).compileComponents();

      CsaaAppInjector.injector = TestBed.inject(Injector);
      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().withCustomerState(CUSTOMER).resetStateOf(store);

      await TestBed.inject(Platform).ready();

      httpTestingController = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(PaymentHistoryListPage);
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('user with multiple policies', () => {
    afterEach(() => {
      // Ensures no pending request
      httpTestingController.verify();
    });

    it('should match snapshot when content loaded', () => {
      fixture.detectChanges();
      flushMockDocuments(httpTestingController, DOCUMENTS_FIXTURE);

      fixture.detectChanges();
      const listComponentNode = fixture.debugElement.query(
        By.css('csaa-payment-history-select-card')
      );
      expect(listComponentNode).toBeTruthy();
      expect(listComponentNode.query(By.css('ion-list'))).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    });
  });

  describe('user with one policy', () => {
    afterEach(() => {
      // Ensures no pending request
      httpTestingController.verify();
    });

    it('should match snapshot when content loaded', () => {
      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks()
        .withCustomerState(CUSTOMER)
        .withPolicyState({
          ...CUSTOMER.csaa_policies,
          policies: [USER1_STATE_FIXTURES_MOCK.POLICIES[0]],
        })
        .withPaymentState({
          ...CUSTOMER.csaa_payment,
          payments: [USER1_STATE_FIXTURES_MOCK.PAYMENTS[0]],
        })
        .resetStateOf(store);
      fixture = TestBed.createComponent(PaymentHistoryListPage);
      fixture.detectChanges();

      flushMockDocuments(httpTestingController, DOCUMENTS_FIXTURE);
      fixture.detectChanges();

      const listComponentNode = fixture.debugElement.query(By.css('csaa-payment-history-card'));
      expect(listComponentNode).toBeTruthy();
      expect(listComponentNode.query(By.css('ion-list'))).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    });
  });
});
