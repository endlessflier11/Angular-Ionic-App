import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { AlertController, Platform } from '@ionic/angular';

import { PaymentIndexPage } from './payment-index.page';
import {
  AlertControllerMock,
  AUTOPAY_ENROLLMENT_MOCKUP_DATA,
  BillingSummaryResponseMock,
  BILLING_HISTORY_RESPONSE_MULTIPLE_POLICY,
  BILLING_SUMMARY_MULTIPLE_POLICIES_MOCK,
  By,
  CONFIG_STATE_FIXTURE_MOCK,
  CustomerResponseMock,
  CUSTOMER_MULTIPLE_POLICIES,
  MULTIPLE_POLICIES_MOCK,
  PageTestingModule,
  PoliciesResponseMock,
  clickEvent,
  mockDateNow,
  StoreTestBuilder,
  ContactInfoResponseMock,
  PolicyDocumentsResponseMock,
  DOCUMENTS_FIXTURE,
} from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { noop } from 'rxjs';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { HttpTestingController } from '@angular/common/http/testing';
import { BillingHistoryResponseMock, WalletResponseMock } from '@app/testing';
import { GlobalStateService, CallService } from '../../_core/services';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { PolicyHelper } from '../../_core/shared/policy.helper';
import { Category, EventName, PaymentType } from '../../_core/interfaces';
import { AppEndpointsEnum } from '../../_core/interfaces';
import DateHelper from '../../_core/shared/date.helper';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { MetadataService } from '../../_core/services/metadata.service';
import { PolicyType } from '../../_core/interfaces/policy.interface';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../_core/store';
import { POLICY_DOCUMENTS_RESPONSE_MOCK } from '../../../../../testing/fixtures/policy-document-mock.fixtures';

const mockAutopayEnrollmentForPolicy = ({ policyNumber, policyType }, httpTestingController) => {
  const typeCd = PolicyHelper.typeCodeFromEnum(PolicyHelper.typeToEnum(policyType), true);
  const url = `${
    AppEndpointsEnum[AppEndpointsEnum.billingAutopay]
  }?policyNumber=${policyNumber}&typeCd=${typeCd}&sourceSystem=PAS`;
  httpTestingController
    .match(url)
    .forEach((req) => req.flush(AUTOPAY_ENROLLMENT_MOCKUP_DATA[policyNumber]));
};

describe('PaymentIndexPage', () => {
  let component: PaymentIndexPage;
  let fixture: ComponentFixture<PaymentIndexPage>;
  let httpTestingController: HttpTestingController;
  let analyticsService: jest.Mocked<AnalyticsService>;
  let alertControllerMock: AlertControllerMock;
  const realDateNow = Date.now.bind(global.Date);

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [PaymentIndexPage],
        imports: [
          PageTestingModule.withConfig({
            providesAlert: true,
            providesLoader: true,
            providesStorage: true,
            providesPlatform: true,
            providesConfig: true,
            providesAnalytics: true,
            providesRouter: true,
          }),
          CsaaCoreModule.forRoot(),
          UiKitsModule,
          CsaaPaymentsUiKitsModule,
          NgxsModule.forRoot([AppState]),
        ],
        providers: [
          {
            provide: GlobalStateService,
            useValue: {
              getIsStandalone: jest.fn().mockReturnValue(true),
              getEvalueEnrolled: jest.fn().mockReturnValue(false),
              setRegistrationId: jest.fn(),
              setWalletId: jest.fn().mockReturnValue(true),
              getPaymentsTesting: jest.fn().mockReturnValue(false),
            },
          },
          { provide: CallService, useValue: { call: jest.fn() } },
          {
            provide: MetadataService,
            useValue: {
              setUserAnalyticsMetadata: jest.fn(),
              getUserAnalyticsMetadata: jest.fn().mockReturnValue({
                uuid: '',
                club_code: '',
              }),
            },
          },
        ],
      }).compileComponents();

      StoreTestBuilder.withConfigState(CONFIG_STATE_FIXTURE_MOCK).resetStateOf(
        TestBed.inject(Store)
      );

      CsaaAppInjector.injector = TestBed.inject(Injector);
      httpTestingController = TestBed.inject(HttpTestingController);
      analyticsService = TestBed.inject(AnalyticsService) as jest.Mocked<AnalyticsService>;
      alertControllerMock = TestBed.inject(AlertController) as any;

      mockDateNow('2020-11-15');

      await TestBed.inject(Platform).ready();
      fixture = TestBed.createComponent(PaymentIndexPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  afterEach(() => {
    global.Date.now = realDateNow;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Exactly One Policy', () => {
    const MOCK: { [k: string]: any } = {};
    let flushRequestsInGroup = (_?) => {};

    beforeEach(fakeAsync(() => {
      // Initialize component data
      MOCK.customer = CustomerResponseMock.create().toJson();
      MOCK.policies = [PoliciesResponseMock.create().toJson()[0]];
      MOCK.billingHistory = BillingHistoryResponseMock.create().toJson();
      MOCK.billingSummary = BillingSummaryResponseMock.create().withPaymentDue().toJson();
      MOCK.wallet = WalletResponseMock.create().toJson();
      MOCK.contactInformation = ContactInfoResponseMock.create().toJson();
      MOCK.policyDocuments = DOCUMENTS_FIXTURE;

      const [registration] = MOCK.customer.registrations;
      const ownerId = registration.registrationId;

      flushRequestsInGroup = (_MOCK = MOCK) => {
        httpTestingController
          .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
          .forEach((req) => req.flush(MOCK.customer));
        httpTestingController
          .match(AppEndpointsEnum[AppEndpointsEnum.policies])
          .forEach((req) => req.flush(MOCK.policies));
        httpTestingController
          .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
          .forEach((req) => req.flush(MOCK.billingSummary));

        // Autopay mockup
        MOCK.policies
          .filter(
            (p) =>
              MOCK.billingSummary.billingSummaries.find(
                ({ policyNumber }) => policyNumber === p.policyNumber
              ).autoPay === 'true'
          )
          .forEach((p) => mockAutopayEnrollmentForPolicy(p, httpTestingController));
        const INSTALLMENT_FEES = {
          autoPayFees: { eft: 3, pciCreditCard: 3, pciDebitCard: 3 },
          otpFees: { eft: 7, pciCreditCard: 7, pciDebitCard: 7 },
        };
        httpTestingController
          .match(
            (r) => r.url.indexOf(AppEndpointsEnum[AppEndpointsEnum.billingInstallmentFees]) >= 0
          )
          .forEach((r) => r.flush(INSTALLMENT_FEES));

        httpTestingController
          .match(AppEndpointsEnum[AppEndpointsEnum.billingHistory])
          .forEach((req) => req.flush(MOCK.billingHistory));

        httpTestingController
          .match(`${AppEndpointsEnum[AppEndpointsEnum.billingWallet]}?ownerId=${ownerId}`)
          .forEach((req) => req.flush(MOCK.wallet));

        httpTestingController
          .match(AppEndpointsEnum[AppEndpointsEnum.policyDocuments])
          .forEach((req) => req.flush(MOCK.policyDocuments));

        httpTestingController
          .match((r) =>
            new RegExp(`^${AppEndpointsEnum[AppEndpointsEnum.contactInformation]}\\?state=`).test(
              r.urlWithParams
            )
          )
          .forEach((req) => req.flush(MOCK.contactInformation));
      };
    }));

    afterEach(() => {
      // Ensures no pending request
      httpTestingController.verify();
    });

    it('should match snapshot', fakeAsync(() => {
      component.ngOnInit();
      component.ionViewWillEnter();
      flushRequestsInGroup();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    }));

    it('should track the call button', () => {
      component.ngOnInit();
      component.ionViewWillEnter();
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

    it('should render billing history for one policy', fakeAsync(() => {
      MOCK.billingHistory = BillingHistoryResponseMock.create().toJson();

      component.ngOnInit();
      component.ionViewWillEnter();
      flushRequestsInGroup();
      fixture.detectChanges();

      const historyContentCard = fixture.debugElement.query(By.css('csaa-payment-history-card'));
      expect(historyContentCard).toBeTruthy();

      const items = historyContentCard.queryAll(By.css('ion-list ion-item'));
      expect(items.length).toEqual(
        MOCK.billingHistory.billingHistoryPoliciesResponse[0].payments.length
      );
    }));

    it('should track Home Accessed after back button click', () => {
      component.ngOnInit();
      component.ionViewWillEnter();
      flushRequestsInGroup();
      fixture.detectChanges();

      component.onClickBackBtn();
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        EventName.HOME_ACCESSED,
        Category.global,
        {
          event_type: 'Link Accessed',
          link: 'Home',
        }
      );
      expect(analyticsService.trackEvent).toHaveBeenCalledTimes(1);
    });

    it('should not render billing history for one policy when empty', fakeAsync(() => {
      MOCK.billingHistory = BillingHistoryResponseMock.create().whenEmpty().toJson();

      component.ngOnInit();
      component.ionViewWillEnter();
      flushRequestsInGroup(MOCK);
      fixture.detectChanges();

      const historyContentCard = fixture.debugElement.query(By.css('csaa-payment-history-card'));
      expect(historyContentCard).toBeFalsy();
    }));
  });

  describe('Multiple Policies : Autopay, Payment due, Remaining premium', () => {
    const MOCK: { [k: string]: any } = {};
    let flushRequestsInGroup = noop;

    beforeEach(fakeAsync(() => {
      try {
        // Initialize component data
        MOCK.contactInformation = ContactInfoResponseMock.create().toJson();
        MOCK.customer = CustomerResponseMock.create(CUSTOMER_MULTIPLE_POLICIES).toJson();
        MOCK.policies = PoliciesResponseMock.create(MULTIPLE_POLICIES_MOCK).toJson();
        MOCK.billingHistory = BillingHistoryResponseMock.create(
          BILLING_HISTORY_RESPONSE_MULTIPLE_POLICY
        ).toJson();
        MOCK.billingSummary = BillingSummaryResponseMock.create(
          BILLING_SUMMARY_MULTIPLE_POLICIES_MOCK
        )
          .withPaymentDue()
          .toJson();
        MOCK.policyDocuments = PolicyDocumentsResponseMock.create(
          POLICY_DOCUMENTS_RESPONSE_MOCK
        ).toJson();
        MOCK.policyDocuments = DOCUMENTS_FIXTURE;

        const [registration] = MOCK.customer.registrations;
        const ownerId = registration.registrationId;

        flushRequestsInGroup = () => {
          httpTestingController
            .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
            .forEach((req) => req.flush(MOCK.customer));
          httpTestingController
            .match(AppEndpointsEnum[AppEndpointsEnum.policies])
            .forEach((req) => req.flush(MOCK.policies));
          httpTestingController
            .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
            .forEach((req) => req.flush(MOCK.billingSummary));

          // Autopay mockup
          MOCK.policies
            .filter(
              (p) =>
                MOCK.billingSummary.billingSummaries.find(
                  ({ policyNumber }) => policyNumber === p.policyNumber
                ).autoPay === 'true'
            )
            .forEach((p) => mockAutopayEnrollmentForPolicy(p, httpTestingController));

          const INSTALLMENT_FEES = {
            autoPayFees: { eft: 3, pciCreditCard: 3, pciDebitCard: 3 },
            otpFees: { eft: 7, pciCreditCard: 7, pciDebitCard: 7 },
          };
          httpTestingController
            .match(
              (r) => r.url.indexOf(AppEndpointsEnum[AppEndpointsEnum.billingInstallmentFees]) >= 0
            )
            .forEach((r) => r.flush(INSTALLMENT_FEES));

          httpTestingController
            .match(AppEndpointsEnum[AppEndpointsEnum.billingHistory])
            .pop()
            .flush(MOCK.billingHistory);

          httpTestingController
            .match(`${AppEndpointsEnum[AppEndpointsEnum.billingWallet]}?ownerId=${ownerId}`)
            .forEach((req) => req.flush(WalletResponseMock.create().toJson()));

          httpTestingController
            .match(AppEndpointsEnum[AppEndpointsEnum.policyDocuments])
            .forEach((req) => req.flush(MOCK.policyDocuments));

          httpTestingController
            .match((r) =>
              new RegExp(`^${AppEndpointsEnum[AppEndpointsEnum.contactInformation]}\\?state=`).test(
                r.urlWithParams
              )
            )
            .forEach((req) => req.flush(MOCK.contactInformation));

          Object.entries(component.autoPayEnrollmentStatusMap).forEach(([_, enrollment]) => {
            if (!enrollment) {
              return;
            }
            httpTestingController
              .match(`${AppEndpointsEnum[AppEndpointsEnum.policyDocuments]}`)
              .forEach((req) => req.flush(MOCK.policyDocuments));
          });
        };

        component.ngOnInit();
        component.ionViewWillEnter();
        flushRequestsInGroup();
        fixture.detectChanges();
      } catch (e) {
        console.log({ error: e });
      }
    }));

    afterEach(() => {
      // Ensures no pending request
      httpTestingController.verify();
    });

    it('should match snapshot', async () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should match snapshot when all minimum ammounts are paid', fakeAsync(async () => {
      const EXPECTED_PAID_POLICIES = ['AZAC910018915'];

      const payallCard = fixture.debugElement.query(By.css('csaa-pay-all-policies-card'));
      expect(payallCard).toBeTruthy();

      payallCard.componentInstance.makePayment();
      flushMicrotasks();
      fixture.detectChanges();

      // Confirm payment
      expect(alertControllerMock.create).toHaveBeenCalled();
      const alertInstance = alertControllerMock.getTop();
      alertInstance.selectButton('Confirm');
      flushMicrotasks();

      // Respond to payment request
      httpTestingController.expectOne(AppEndpointsEnum[AppEndpointsEnum.billingPayment]).flush({
        receiptNumber: '1610722',
        statusDescription: 'SUCC',
      });
      flushRequestsInGroup(); // Now we're reloading the entities; respond to requests

      flushMicrotasks();
      fixture.detectChanges();

      // Expect success cards
      expect(fixture).toMatchSnapshot();

      const paymentSucceded = fixture.debugElement.queryAll(By.css('csaa-payment-succeeded-card'));
      expect(paymentSucceded.length).toBe(EXPECTED_PAID_POLICIES.length);
      EXPECTED_PAID_POLICIES.forEach((policyNumber) => {
        const expectedPolicy = paymentSucceded
          .pop()
          .query(By.cssAndText('ion-card-content h2', policyNumber));
        expect(expectedPolicy).toBeTruthy();
      });
    }));

    it('should track Home Accessed after back button click', () => {
      try {
        component.onClickBackBtn();
        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          EventName.HOME_ACCESSED,
          Category.global,
          {
            event_type: 'Link Accessed',
            link: 'Home',
          }
        );
        expect(analyticsService.trackEvent).toHaveBeenCalledTimes(1);
      } catch (error) {
        console.error(error);
        throw error;
      }
    });

    it('should track the make payment event', () => {
      const payments = [
        {
          vehicles: ['Lexus NX', 'BMW X1'],
          subtitle: 'test',
          autoPay: true,
          minimumAmount: 20,
          remainingPremium: 10000,
          otherAmount: 1000,
          type: PaymentType.other,
          nextDueDate: DateHelper.toDate('2040-08-19'),
          nextAmount: 30,
          allPolicies: false,
          policyNumber: 'AZSS294857564',
          policyType: PolicyType.Auto,
          dueDate: DateHelper.toDate('2018-08-10'),
          isPastDue: true,
          isPaymentDue: true,
          amount: 260.75,
          policyRiskState: 'test',
          autopayEnrollment: null,
        },
      ];
      component.trackMakePaymentEvent(payments);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        EventName.MAKE_A_PAYMENT_SELECTED,
        Category.payments,
        {
          event_type: 'Option Selected',
          selection: 'Make A Payment',
          amount_due: payments.reduce(
            (currentAmount, payment) => currentAmount + payment.minimumAmount,
            0
          ),
          policies: [
            {
              policy_number: 'AZSS294857564',
              policy_state: 'test',
              policy_type: 'Auto',
            },
          ],
        }
      );
    });

    it('should match snapshot when all remaining premimum are paid', fakeAsync(async () => {
      const EXPECTED_PAID_POLICIES = ['WYSS910014303', 'AZH3910018916', 'AZAC910018915'];

      const payallCard = fixture.debugElement.query(By.css('csaa-pay-all-policies-card'));
      expect(payallCard).toBeTruthy();

      payallCard.componentInstance.setPaymentAmountType(PaymentType.remaining);
      payallCard.componentInstance.makePayment();
      flushMicrotasks();
      fixture.detectChanges();

      // Confirm payment
      expect(alertControllerMock.create).toHaveBeenCalled();
      const alertInstance = alertControllerMock.getTop();
      alertInstance.selectButton('Confirm');
      flushMicrotasks();

      httpTestingController.expectOne(AppEndpointsEnum[AppEndpointsEnum.billingPayment]).flush({
        receiptNumber: '1610722',
        statusDescription: 'SUCC',
      });
      flushRequestsInGroup(); // Now we're reloading the entities; respond to requests

      flushMicrotasks();
      fixture.detectChanges();

      // Expect success cards
      expect(fixture).toMatchSnapshot();

      const paymentSucceded = fixture.debugElement.queryAll(By.css('csaa-payment-succeeded-card'));
      expect(paymentSucceded.length).toBe(EXPECTED_PAID_POLICIES.length);
    }));
  });

  // Todo: possible test cases from v3
  // - sould match snapshot when there is no overdue payment
  // - sould match snapshot when there is more than 1 overdue payment
  // - should open modal when select amount was emitted from make payment card
  // - should open modal when select payment was emitted from make payment card
  // - should render select policy card and not render payment history card
  // - should show pay all policies card whent there are more than 1 payment
  // - should not show pay all policies card whent there is just 1 payment
  // - should hide select policy card and render payment history card
  // - Should hide the history card if there is no history
  // - should match snapshot when 1 payment is paid
  // - should match snapshot when all payments are paid

  // - test making payments
});
