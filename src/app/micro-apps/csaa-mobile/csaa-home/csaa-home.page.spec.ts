/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { CsaaHomePage } from './csaa-home.page';
import {
  AlertControllerMock,
  AUTH_STATE_FIXTURE_MOCK,
  AuthMockService,
  AUTOPAY_ENROLLMENT_MOCKUP_DATA,
  BillingHistoryResponseMock,
  BillingSummaryResponseMock,
  By,
  ClaimsResponseMock,
  CONFIG_STATE_FIXTURE_MOCK,
  CONTACT_INFO_STATE_FIXTURE_MOCK,
  ContactInfoResponseMock,
  CustomerResponseMock,
  getHomePageOnErrorFixtures,
  HOME_PAGE_ALL_POLICIES_MOCKS,
  METADATA_STATE_FIXTURE_MOCK,
  mockDateNow,
  PageTestingModule,
  PoliciesResponseMock,
  WalletResponseMock,
} from '@app/testing';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { InsuranceCardComponent } from './insurance-card/insurance-card.component';
import { PaymentsCardComponent } from './payments-card/payments-card.component';
import { PolicyCancelledCardComponent } from './policy-cancelled-card/policy-cancelled-card.component';
import { ErrorCardComponent } from './error-card/error-card.component';
import { CoveragesCardComponent } from './coverages-card/coverages-card.component';
import { ClaimsCardComponent } from './claims-card/claims-card.component';
import { NoActivePoliciesCardComponent } from './no-active-policies-card/no-active-policies-card.component';
import { GetAQuoteCardComponent } from './get-a-quote-card/get-a-quote-card.component';
import { FileAClaimCardComponent } from './file-a-claim-card/file-a-claim-card.component';
import { AlertController, NavController, PopoverController } from '@ionic/angular';
import { PolicyService } from '../_core/services';
import { CustomErrorHandler } from '../_core/shared/custom-error-handler';
import { AnalyticsService, CallService, GlobalStateService } from '../_core/services/';
import { PolicyDocumentHelper } from '../_core/shared/policy-document.helper';

import { NEVER } from 'rxjs';
import { CsaaAppInjector } from '../csaa-app.injector';
import { Injector } from '@angular/core';
import { AppEndpointsEnum, Category, EventName } from '../_core/interfaces';
import { delay } from '../_core/helpers';
import { CsaaPaymentsUiKitsModule } from '../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { Store } from '@ngxs/store';
import { DocumentsCardComponent } from './documents-card/documents-card.component';
import { PaperlessPreferenceCardComponent } from './paperless-preference-card/paperless-preference-card.component';
import { PolicyHelper } from '../_core/shared/policy.helper';

const mockAutopayEnrollmentForPolicy = ({ policyNumber, policyType }, httpTestingController) => {
  const typeCd = PolicyHelper.typeCodeFromEnum(PolicyHelper.typeToEnum(policyType), true);
  const url = `${
    AppEndpointsEnum[AppEndpointsEnum.billingAutopay]
  }?policyNumber=${policyNumber}&typeCd=${typeCd}&sourceSystem=PAS`;
  httpTestingController
    .match(url)
    .forEach((req) => req.flush(AUTOPAY_ENROLLMENT_MOCKUP_DATA[policyNumber]));
};

const flushMockResponses = (
  httpTestingController: HttpTestingController,
  MOCK: {
    customer: any;
    policies: any;
    claims: any;
    summary: any;
    billingHistory?: any;
    wallet?: any;
  } & { [k: string]: any }
) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
    .forEach((req) => req.flush(MOCK.customer));

  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.policies])
    .forEach((req) => req.flush(MOCK.policies));

  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.billingSummary])
    .forEach((req) => req.flush(MOCK.summary));

  // Autopay mockup
  MOCK.policies
    .filter(
      (p) =>
        MOCK.summary.billingSummaries.find(({ policyNumber }) => policyNumber === p.policyNumber)
          .autoPay === 'true'
    )
    .forEach((p) => mockAutopayEnrollmentForPolicy(p, httpTestingController));

  httpTestingController
    .match((r) =>
      new RegExp(`^${AppEndpointsEnum[AppEndpointsEnum.contactInformation]}\\?state=`).test(
        r.urlWithParams
      )
    )
    .forEach((req) => req.flush(MOCK.contactInformation));

  const INSTALLMENT_FEES = {
    autoPayFees: { eft: 3, pciCreditCard: 3, pciDebitCard: 3 },
    otpFees: { eft: 7, pciCreditCard: 7, pciDebitCard: 7 },
  };
  httpTestingController
    .match((r) => {
      return r.url.indexOf(AppEndpointsEnum[AppEndpointsEnum.billingInstallmentFees]) >= 0;
    })
    .forEach((r) => {
      r.flush(INSTALLMENT_FEES);
    });

  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.billingHistory])
    .pop()
    .flush(MOCK.billingHistory);

  httpTestingController
    .match((r) => {
      return r.url.indexOf(AppEndpointsEnum[AppEndpointsEnum.billingWallet]) >= 0;
    })
    .pop()
    .flush(MOCK.wallet);

  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.claims])
    .forEach((req) => req.flush(MOCK.claims));
};

describe('CsaaHomePage', () => {
  let component: CsaaHomePage;
  let fixture: ComponentFixture<CsaaHomePage>;
  let httpTestingController: HttpTestingController;
  let policyService: PolicyService;
  let authService: AuthMockService;
  let analyticsService;
  let store: Store;
  let MOCK: {
    customer: any;
    policies: any;
    claims: any;
    summary: any;
    billingHistory?: any;
    wallet?: any;
  } & { [k: string]: any };
  const realDateNow = Date.now.bind(global.Date);

  beforeEach(() => {
    MOCK = {
      customer: null,
      policies: null,
      claims: null,
      summary: null,
      billingHistory: null,
      wallet: null,
    };
    MOCK.contactInformation = ContactInfoResponseMock.create().toJson();
    MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES).toJson();
    MOCK.billingHistory = BillingHistoryResponseMock.createForPolicies(MOCK.policies).toJson();
    MOCK.wallet = WalletResponseMock.create().toJson();

    TestBed.configureTestingModule({
      declarations: [
        CsaaHomePage,
        InsuranceCardComponent,
        PaymentsCardComponent,
        PolicyCancelledCardComponent,
        ErrorCardComponent,
        CoveragesCardComponent,
        ClaimsCardComponent,
        NoActivePoliciesCardComponent,
        GetAQuoteCardComponent,
        FileAClaimCardComponent,
        DocumentsCardComponent,
        PaperlessPreferenceCardComponent,
      ],
      imports: [
        PageTestingModule.withConfig({
          providesAuth: true,
          providesStorage: true,
          providesPlatform: true,
          providesAlert: true,
          providesConfig: true,
          providesAnalytics: true,
          providesMetadata: true,
        }),
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
      ],
      providers: [
        { provide: NavController, useValue: { push: jest.fn() } },
        { provide: CustomErrorHandler, useValue: { handleError: jest.fn() } },
        { provide: PolicyDocumentHelper, useValue: { openDocument: jest.fn() } },
        {
          provide: PopoverController,
          useValue: { create: jest.fn(() => ({ present: jest.fn() })) },
        },
        { provide: CallService, useValue: { call: jest.fn() } },
        {
          provide: GlobalStateService,
          useValue: {
            getIsStandalone: jest.fn(() => false),
            setRegistrationId: jest.fn(),
            getEvalueEnrolled: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.reset({
      csaa_app: {
        ...store.snapshot().csaa_app,
        csaa_config: CONFIG_STATE_FIXTURE_MOCK,
        csaa_auth: AUTH_STATE_FIXTURE_MOCK,
        csaa_contactInfo: CONTACT_INFO_STATE_FIXTURE_MOCK,
        csaa_metadata: METADATA_STATE_FIXTURE_MOCK,
      },
    });
    // StoreTestBuilder.withDefaultMocks().resetStateOf(store);

    CsaaAppInjector.injector = TestBed.inject(Injector);

    analyticsService = TestBed.inject(AnalyticsService);
    httpTestingController = TestBed.inject(HttpTestingController);
    policyService = TestBed.inject(PolicyService);

    authService = TestBed.inject(AuthMockService) as jest.Mocked<AuthMockService>;
    authService.fakeLogin();

    fixture = TestBed.createComponent(CsaaHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    global.Date.now = realDateNow;
    httpTestingController
      .match(AppEndpointsEnum[AppEndpointsEnum.billingWallet])
      .forEach((req) => req.flush(MOCK.wallet));

    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    // We are only interested in knowing if the component creates successfully at this point
    store.dispatch = jest.fn().mockReturnValue(NEVER);
    component.ionViewWillEnter();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot after load', fakeAsync(async () => {
    MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
    MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
    MOCK.summary = BillingSummaryResponseMock.create(
      HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
    ).toJson();

    component.ionViewWillEnter();
    flushMockResponses(httpTestingController, MOCK);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  }));

  it('should match snapshot after load with header', fakeAsync(async () => {
    MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
    MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
    MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES).toJson();
    MOCK.summary = BillingSummaryResponseMock.create(
      HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
    ).toJson();

    store.reset({
      csaa_app: {
        ...store.snapshot().csaa_app,
        csaa_config: { ...store.snapshot().csaa_app.csaa_config, showHomeHeader: true },
      },
    });

    component.ngOnInit();
    component.ionViewWillEnter();
    flushMockResponses(httpTestingController, MOCK);

    await fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  }));

  it('should show error cards', fakeAsync(() => {
    const consoleLog = global.console.log;
    const consoleError = global.console.error;
    global.console.log = jest.fn();
    global.console.error = jest.fn();

    component.ngOnInit();
    component.ionViewWillEnter();
    const ON_ERROR = getHomePageOnErrorFixtures();

    httpTestingController
      .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
      .forEach((req) => req.flush(ON_ERROR.customer));

    httpTestingController.match(AppEndpointsEnum[AppEndpointsEnum.policies]).forEach((req) =>
      req.flush('Internal server error', {
        status: 500,
        statusText: 'No message available',
      })
    );

    fixture.detectChanges();
    const errorCards = fixture.nativeElement.querySelectorAll('csaa-error-card');
    expect(errorCards).toBeDefined();
    expect(errorCards.length).toBe(4);
    expect(fixture.componentInstance.loading).toBeFalsy();
    expect(fixture).toMatchSnapshot();
    global.console.log = consoleLog;
    global.console.error = consoleError;
  }));

  it('should show proof of insurance, coverages, claims and payments', () => {
    try {
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES).toJson();
      MOCK.summary = BillingSummaryResponseMock.create(
        HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
      ).toJson();
      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should detect payment is past due and warn user', async () => {
    try {
      mockDateNow('2020-11-15');
      component.showPaymentDueWarning = jest.fn();
      component.ngOnInit();
      component.ionViewWillEnter();

      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES).toJson();
      MOCK.summary = BillingSummaryResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY)
        .withPaymentDue()
        .withPaymentPastDue()
        .toJson();
      component.loadData();

      flushMockResponses(httpTestingController, MOCK);

      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
      await delay(100); // :(
      expect(component.showPaymentDueWarning).toHaveBeenCalled();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  describe('cancelled policies', () => {
    it('Should only show the cancelled cards if all policies are cancelled', () => {
      mockDateNow('2020-10-27');
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES)
        .cancelPolicy(0)
        .cancelPolicy(1)
        .cancelPolicy(2)
        .toJson();
      MOCK.summary = BillingSummaryResponseMock.create(
        HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
      ).toJson();
      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('Should show no active policies card if all policies are cancelled after grace period', () => {
      mockDateNow('2020-10-27');

      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES)
        .cancelPolicy(0)
        .cancelPolicy(1)
        .cancelPolicy(2)
        .toJson();
      MOCK.summary = BillingSummaryResponseMock.create(
        HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
      ).toJson();
      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);

      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('Should show the cancelled card with the other cards if only one policy cancelled', () => {
      mockDateNow('2020-10-27');

      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES)
        .cancelPolicy(0)
        .toJson();
      MOCK.summary = BillingSummaryResponseMock.create(
        HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
      ).toJson();
      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);

      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });

  describe('pull to refresh', () => {
    it('should refresh data in all services', async () => {
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      try {
        const refresher = fixture.debugElement.query(By.css('ion-refresher'));

        policyService.loadData = jest.fn().mockReturnValue(NEVER);

        const $event = { target: { ionRefresherInstance: '123' } };
        refresher.triggerEventHandler('ionRefresh', $event);

        httpTestingController
          .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
          .forEach((req) => req.flush(MOCK.customer));

        httpTestingController.match((request) => {
          console.log(request);
          return false;
        });
        expect(policyService.loadData).toBeCalledTimes(1);

        expect(component.refresher).toEqual($event.target);
        expect(component.loading).toBeTruthy();
      } catch (error) {
        console.error(error);
        fail(error.message);
      }
    });
  });

  describe('analytics', () => {
    beforeEach(() => {
      analyticsService = TestBed.inject(AnalyticsService);
    });

    it('should call analytics identify with proper information', async () => {
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES).toJson();
      MOCK.summary = BillingSummaryResponseMock.create(
        HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
      ).toJson();

      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);
      const { clubCode, policies, deviceUuid, email } = METADATA_STATE_FIXTURE_MOCK;
      const { firstName, lastName, email: mdmEmail, mdmId } = MOCK.customer;
      const state = policies.map((p) => p.riskState);
      const { codeVersion } = CONFIG_STATE_FIXTURE_MOCK.activeConfigData;
      const { custKey } = AUTH_STATE_FIXTURE_MOCK;

      expect(analyticsService.identify).toHaveBeenCalledWith({
        first_name: firstName,
        last_name: lastName,
        mdm_id: mdmId,
        reg_id: custKey,
        email,
        mdm_email: mdmEmail,
        is_guest_user: 'no',
        club_code: clubCode,
        policy_numbers: ['AZAC910018915', 'AZH3910018916', 'AZPU910018917'],
        state,
        app_version: codeVersion,
        uuid: deviceUuid,
      });

      httpTestingController
        .match(`${AppEndpointsEnum[AppEndpointsEnum.billingWallet]}`)
        .forEach((req) => req.flush(MOCK.wallet));
    });

    it('should show payment is past due alert and log to analytics', async () => {
      try {
        const alertControllerMock: AlertControllerMock = TestBed.inject(AlertController) as any;

        await component.showPaymentDueWarning(null);

        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          EventName.PAYMENT_PAST_DUE_NOTICE,
          Category.payments,
          { event_type: 'Messaged', policies: [] }
        );

        expect(alertControllerMock.create).toHaveBeenCalled();
        expect(alertControllerMock.getTop()).toBeDefined();
      } catch (error) {
        console.error(error);
        fail(error.message);
      }
    });

    it('should track the contact initiated from call', () => {
      component.call();
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

  describe('paperless preference', () => {
    beforeEach(() => {
      mockDateNow('2020-11-15');
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER).toJson();
      MOCK.claims = ClaimsResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CLAIMS).toJson();
      MOCK.policies = PoliciesResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.POLICIES).toJson();
      MOCK.summary = BillingSummaryResponseMock.create(
        HOME_PAGE_ALL_POLICIES_MOCKS.BILLING_SUMMARY
      ).toJson();
    });

    it('should display enrollment card when not enrolled', async () => {
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER)
        .patch({ isPaperlessEnrollmentPending: true })
        .toJson();
      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);
      fixture.detectChanges();
      const node = fixture.debugElement.query(By.cssAndText('ion-card', 'Pending Enrollment'));
      expect(node).toBeTruthy();
    });

    it('should not display enrollment card when enrolled', async () => {
      MOCK.customer = CustomerResponseMock.create(HOME_PAGE_ALL_POLICIES_MOCKS.CUSTOMER)
        .patch({ isPaperlessEnrollmentPending: false })
        .toJson();

      component.ngOnInit();
      component.ionViewWillEnter();
      flushMockResponses(httpTestingController, MOCK);
      fixture.detectChanges();
      const node = fixture.debugElement.query(By.cssAndText('ion-card', 'Pending Enrollment'));
      expect(node).toBeFalsy();
    });
  });

  // 'Should listen for errors on the errorService'
  // 'Should alert for inactive policy condition',
  // 'Should not alert when an alert has already fired'
  // 'Should not alert when the last alert was within 7 days'
  // 'Should update the lastAlertTime when an alert is triggered',
});
