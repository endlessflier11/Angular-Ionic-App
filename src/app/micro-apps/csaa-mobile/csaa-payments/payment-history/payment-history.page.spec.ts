import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { PaymentHistoryPage } from './payment-history.page';
import {
  BillingHistoryResponseMock,
  BillingSummaryResponseMock,
  By,
  clickEvent,
  CustomerResponseMock,
  PageTestingModule,
  PoliciesResponseMock,
  StoreTestBuilder,
  WalletResponseMock,
} from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CallService } from '../../_core/services/call.service';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CsaaHttpClientModule } from '../../_core/csaa-http-client.module';
import { AnalyticsService } from '../../_core/services';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { Category, EventName } from '../../_core/interfaces';
import { Store } from '@ngxs/store';
import { Platform } from '@ionic/angular';

describe('PaymentHistoryPage', () => {
  let component: PaymentHistoryPage;
  let fixture: ComponentFixture<PaymentHistoryPage>;
  let httpTestingController: HttpTestingController;
  let analyticsService;

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [PaymentHistoryPage],
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
          { provide: ActivatedRoute, useValue: { params: of({ policyNumber: 'demo' }) } },
          { provide: CallService, useValue: { call: jest.fn() } },
        ],
      }).compileComponents();

      CsaaAppInjector.injector = TestBed.inject(Injector);
      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      analyticsService = TestBed.inject(AnalyticsService);
      httpTestingController = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(PaymentHistoryPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Registration ID is Null', () => {
    const MOCK: { [k: string]: any } = {};
    let flushRequestsInGroup = (_?) => {};

    beforeEach(fakeAsync(() => {
      // Initialize component data
      MOCK.customer = CustomerResponseMock.create().toJson();
      MOCK.policies = [PoliciesResponseMock.create().toJson()[0]];
      MOCK.billingHistory = BillingHistoryResponseMock.create().toJson();
      MOCK.billingSummary = BillingSummaryResponseMock.create().withPaymentDue().toJson();
      MOCK.wallet = WalletResponseMock.create().toJson();

      // const [registration] = MOCK.customer.registrations;
      // const ownerId = registration.registrationId;

      flushRequestsInGroup = (_MOCK = MOCK) => {
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
        //   .forEach((req) => req.flush(_MOCK.customer));
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.policies])
        //   .forEach((req) => req.flush(_MOCK.policies));
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
        //   .forEach((req) => req.flush(_MOCK.billingSummary));
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
        //   .forEach((req) => req.flush(_MOCK.customer));
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.policies])
        //   .forEach((req) => req.flush(_MOCK.policies));
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
        //   .forEach((req) => req.flush(_MOCK.billingSummary));
        //
        // httpTestingController
        //   .match(AppEndpointsEnum[AppEndpointsEnum.billingHistory])
        //   .pop()
        //   .flush(MOCK.billingHistory);
        //
        // httpTestingController
        //   .match(`${AppEndpointsEnum[AppEndpointsEnum.billingWallet]}?ownerId=${ownerId}`)
        //   .forEach((req) => req.flush(WalletResponseMock.create().toJson()));
      };
    }));

    afterEach(() => {
      // Ensures no pending request
      httpTestingController.verify();
    });

    it('should match snapshot when registration ID is null', () => {
      component.ngOnInit();
      flushRequestsInGroup();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should track the call button', () => {
      component.ngOnInit();
      flushRequestsInGroup();
      fixture.detectChanges();

      const callBtn = fixture.debugElement.query(
        By.cssAndText('csaa-working-hours ion-button', 'Call Service')
      );
      callBtn.triggerEventHandler('click', clickEvent);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        EventName.CONTACT_INITIATED,
        Category.global,
        {
          event_type: 'Option Selected',
          selection: 'Call Service',
          method: 'phone',
        }
      );
    });
  });
});
