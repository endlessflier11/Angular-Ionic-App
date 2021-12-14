import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import {
  AlertControllerMock,
  BillingHistoryResponseMock,
  BillingSummaryResponseMock,
  By,
  CustomerResponseMock,
  deepCopy,
  PageTestingModule,
  PoliciesResponseMock,
  // WalletResponseMock,
  clickEvent,
  StoreTestBuilder,
  ContactInfoResponseMock,
} from '@app/testing';
import { MakeOneTimePaymentPage } from './make-one-time-payment.page';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import {
  AppEndpointsEnum,
  Category,
  EventName,
  EventType,
  PaymentType,
  UpcomingPaymentModel,
} from '../../_core/interfaces';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AnalyticsService, CallService, StorageService } from '../../_core/services';
import { AlertController, Platform } from '@ionic/angular';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { HttpTestingController } from '@angular/common/http/testing';
import { PolicyHelper } from '../../_core/shared/policy.helper';
import { Store } from '@ngxs/store';

describe('MakeOneTimePaymentPage', () => {
  let component: MakeOneTimePaymentPage;
  let fixture: ComponentFixture<MakeOneTimePaymentPage>;
  let makePaymentService: MakePaymentService;

  let httpTestingController: HttpTestingController;
  let analyticsService: jest.Mocked<AnalyticsService>;
  let alertControllerMock: AlertControllerMock;
  const PARAM_MAP = new Map();
  PARAM_MAP.set('policyNumber', 'demo');
  const CLUB_CODE = '12345';

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [MakeOneTimePaymentPage],
        imports: [
          PageTestingModule.withConfig({
            providesAlert: true,
            providesLoader: true,
            providesStorage: true,
            providesPlatform: true,
            providesRollbar: true,
            providesConfig: true,
            providesRouter: true,
            providesAnalytics: true,
            providesModal: true,
          }),
          CsaaPaymentsUiKitsModule,
          UiKitsModule,
        ],
        providers: [
          MakePaymentService,
          { provide: ActivatedRoute, useValue: { paramMap: of(PARAM_MAP) } },
          { provide: CallService, useValue: { call: jest.fn() } },
        ],
      }).compileComponents();

      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      CsaaAppInjector.injector = TestBed.inject(Injector);
      httpTestingController = TestBed.inject(HttpTestingController);
      analyticsService = TestBed.inject(AnalyticsService) as jest.Mocked<AnalyticsService>;
      alertControllerMock = TestBed.inject(AlertController) as any;
      const storageServiceMock = TestBed.inject(StorageService) as jest.Mocked<StorageService>;
      storageServiceMock.get.mockResolvedValue(CLUB_CODE);

      makePaymentService = TestBed.inject(MakePaymentService);

      fixture = TestBed.createComponent(MakeOneTimePaymentPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  describe('Exactly One Policy', () => {
    const MOCK: { [k: string]: any } = {};
    let policyNumber: string;

    beforeEach(fakeAsync(() => {
      // Initialize component data
      MOCK.contactInformation = ContactInfoResponseMock.create().toJson();
      MOCK.customer = CustomerResponseMock.create().toJson();
      MOCK.policies = PoliciesResponseMock.create().toJson();
      MOCK.billingSummary = BillingSummaryResponseMock.create().withPaymentDue().toJson();
      MOCK.billingHistory = BillingHistoryResponseMock.create().toJson();

      policyNumber = MOCK.billingSummary.billingSummaries[0].policyNumber;
      PARAM_MAP.set('policyNumber', policyNumber);

      // const [registration] = MOCK.customer.registrations;
      // const ownerId = registration.registrationId;

      component.ngOnInit();
      component.ionViewWillEnter();

      // httpTestingController
      //   .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])[0]
      //   .flush(MOCK.customer);
      // httpTestingController
      //   .match(AppEndpointsEnum[AppEndpointsEnum.policies])[0]
      //   .flush(MOCK.policies);
      // httpTestingController
      //   .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])[0]
      //   .flush(MOCK.billingSummary);
      // httpTestingController
      //   .match(`${AppEndpointsEnum[AppEndpointsEnum.billingWallet]}?ownerId=${ownerId}`)[0]
      //   .flush(WalletResponseMock.create().toJson());

      flushMicrotasks();
      fixture.detectChanges();
    }));

    afterEach(() => {
      // Ensures no pending request
      httpTestingController.verify();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should track the call button', () => {
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

    xit('should make payment successfully', fakeAsync(() => {
      try {
        // Set amount to pay
        const amountToPay = 25;
        const paymentUpdate = new UpcomingPaymentModel(deepCopy(component.upcomingPayment));
        paymentUpdate.type = PaymentType.other;
        paymentUpdate.otherAmount = amountToPay;
        component.upcomingPayment = paymentUpdate;

        // Find payment card and simulate click event
        const paymentCard = fixture.debugElement.query(By.cssAndText('ion-button', 'Pay'));
        expect(paymentCard).toBeTruthy();
        paymentCard.triggerEventHandler('click', {});
        flushMicrotasks();

        // Confirm payment amount alert
        expect(alertControllerMock.create).toHaveBeenCalled();

        const alertInstance = alertControllerMock.getTop();
        alertInstance.selectButton('Confirm');
        flushMicrotasks();

        // Ensure payment request matches API criteria
        const [paymentReq] = httpTestingController.match(
          AppEndpointsEnum[AppEndpointsEnum.billingPayment]
        );
        expect(paymentReq).toBeTruthy();
        expect(paymentReq.request.method).toEqual('POST');
        expect(paymentReq.request.body).toEqual(
          expect.objectContaining({
            totalAmount: amountToPay.toString(),
            testing: false,
            club: CLUB_CODE,
            hash: '',
            lineItems: [
              {
                amount: amountToPay.toString(),
                policyInfo: {
                  policyNumber: paymentUpdate.policyNumber,
                  prodTypeCode: PolicyHelper.getPolicyTypeString(paymentUpdate.policyType),
                  policyPrefix: paymentUpdate.policyNumber.slice(0, 2),
                },
              },
            ],
          })
        );

        expect(makePaymentService.getPaymentResult(policyNumber)).toBeFalsy();

        // Send response for payment request
        paymentReq.flush({ statusDescription: 'SUCC' });
        fixture.detectChanges();

        // Expect to see payment success
        expect(makePaymentService.getPaymentResult(policyNumber)).toBeTruthy();

        // Flush requests from state refresh
        httpTestingController
          .expectOne(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
          .flush(MOCK.billingSummary);
        httpTestingController
          .expectOne(AppEndpointsEnum[AppEndpointsEnum.billingHistory])
          .flush(MOCK.billingHistory);
      } catch (error) {
        console.error(error);
        fail(error.message);
      }
    }));

    it('should track the open payment terms', async () => {
      await component.openPaymentTerms();
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        EventName.TERMS_AND_CONDITIONS_CLICKED,
        Category.payments,
        {
          event_type: 'File Downloaded',
        }
      );
    });

    xit('should handle payment error gracefully', fakeAsync(() => {
      // Set amount to pay
      const amountToPay = 25;
      const paymentUpdate = new UpcomingPaymentModel(deepCopy(component.upcomingPayment));
      paymentUpdate.type = PaymentType.other;
      paymentUpdate.otherAmount = amountToPay;
      component.upcomingPayment = paymentUpdate;

      // Find payment card and simulate click event
      const paymentCard = fixture.debugElement.query(By.cssAndText('ion-button', 'Pay'));
      expect(paymentCard).toBeTruthy();
      paymentCard.triggerEventHandler('click', {});
      flushMicrotasks();

      // Confirm payment amount alert
      expect(alertControllerMock.create).toHaveBeenCalled();

      const alertInstance = alertControllerMock.getTop();
      alertInstance.selectButton('Confirm');
      flushMicrotasks();

      // Ensure payment request matches API criteria
      const [paymentReq] = httpTestingController.match(
        AppEndpointsEnum[AppEndpointsEnum.billingPayment]
      );
      expect(paymentReq).toBeTruthy();
      expect(paymentReq.request.method).toEqual('POST');
      expect(paymentReq.request.body).toEqual(
        expect.objectContaining({
          totalAmount: amountToPay.toString(),
          testing: false,
          club: CLUB_CODE,
          hash: '',
          lineItems: [
            {
              amount: amountToPay.toString(),
              policyInfo: {
                policyNumber: paymentUpdate.policyNumber,
                prodTypeCode: PolicyHelper.getPolicyTypeString(paymentUpdate.policyType),
                policyPrefix: paymentUpdate.policyNumber.slice(0, 2),
              },
            },
          ],
        })
      );

      expect(makePaymentService.getPaymentResult(policyNumber)).toBeFalsy();

      // Send response for payment request
      paymentReq.flush({}, { status: 500, statusText: 'Internal Server Error' });
      fixture.detectChanges();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        EventName.PAYMENT_FAILED,
        Category.payments,
        expect.objectContaining({
          event_type: EventType.AUTOMATED_SYSTEM_PROCESS,
        })
      );

      expect(alertControllerMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          header: 'Payment Failed',
        })
      );
    }));
  });
});
