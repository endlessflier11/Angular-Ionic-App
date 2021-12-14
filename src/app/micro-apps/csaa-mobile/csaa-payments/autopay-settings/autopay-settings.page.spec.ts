import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PaymentService } from '../../_core/services';
import { Store } from '@ngxs/store';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { AutopaySettingsPage } from './autopay-settings.page';
import { FormsModule } from '@angular/forms';
import { EValueEnrollmentStatus, PaymentAccount } from '../../_core/interfaces';

jest.mock('../_shared/services/make-payment.service');
jest.mock('../../_core/services/payment.service');
const POLICY_NUMBER = 'CAAC910026006';
const AUTOPAY_ON_PATCH = {
  autopayEnrollment: {
    enrollmentRecord: {
      receiptNumber: '755229',
      action: 'MODIFY_PMT_ACCT',
      authenticationChannel: 'BO',
      sourceApplicationUsed: 'PCBCKOFF',
      lastUpdatedBy: 'FLUAUS01',
      lastUpdatedOn: '2021-10-05T23:13:47.51-07:00',
      lastUpdatedWorkstationIP: '192.168.53.32',
      billingSystemUpdateStatus: 'POST',
      enrollmentEffectiveDate: '2021-05-11',
      paymentItem: {
        paymentMethod: 'CRDC',
        type: 'INST',
        paymentAccountToken: '5C7C1E56-71F6-934D-4421-A953C24FF8BF',
        card: {
          number: '1347',
          type: 'AMEX',
          printedName: 'jenifer',
          expirationDate: '2021-11-01',
          isCardPresent: false,
          zipCode: null,
        },
        account: null,
      },
    },
    policyNumber: POLICY_NUMBER,
    dataSource: 'PAS',
    policyType: 'PA',
    autoPay: true,
  },
};

const CREDIT_CARD: PaymentAccount = {
  paymentAccountToken: '0AC5D0B0-5383-BBB2-6EF6-0E7C35B81E7D',
  isPreferred: true,
  shortName: 'Tt 5454 5454',
  account: null,
  card: {
    type: 'mastercard',
    isDebitCard: false,
    last4digits: '5454',
    holderName: 'TEST USER',
    printedName: 'TEST USER',
    expirationDate: '2025-12-01',
    zipCode: '22911',
    expired: false,
  },
};

const DEBIT_CARD: PaymentAccount = {
  paymentAccountToken: '0AC5D0B0-5383-BBB2-6EF6-0E7C35B81E7D',
  isPreferred: true,
  shortName: 'Tt 5454 5454',
  account: null,
  card: {
    type: 'mastercard',
    isDebitCard: true,
    last4digits: '5454',
    holderName: 'TEST USER',
    printedName: 'TEST USER',
    expirationDate: '2025-12-01',
    zipCode: '22911',
    expired: false,
  },
};

describe('Autopay Settings page', function () {
  let fixture: ComponentFixture<AutopaySettingsPage>;
  let component: AutopaySettingsPage;
  let store;
  let alertControllerMock;
  const PARAM_MAP = new Map();
  PARAM_MAP.set('policyNumber', POLICY_NUMBER);

  const setAutopayOn = () => {
    StoreTestBuilder.withDefaultMocks()
      .patchCustomerPaymentDataAtIndex(0, AUTOPAY_ON_PATCH)
      .resetStateOf(store);
  };

  const setAutopayOnWithEValue = (status: EValueEnrollmentStatus | null) => {
    StoreTestBuilder.withDefaultMocks()
      .patchCustomerPaymentDataAtIndex(0, AUTOPAY_ON_PATCH)
      .patchPolicy(POLICY_NUMBER, { eValueEnrollment: { status } })
      .resetStateOf(store);
  };

  const setupComponent = (beforeComponentCreate?: () => void) => {
    TestBed.configureTestingModule({
      declarations: [AutopaySettingsPage],
      imports: [
        PageTestingModule.withConfig({
          providesAlert: true,
          providesModal: true,
          providesLoader: true,
          providesStorage: true,
          providesConfig: true,
          providesRouter: true,
          providesAnalytics: true,
          providesPlatform: true,
        }),
        CsaaPaymentsUiKitsModule,
        UiKitsModule,
        FormsModule,
      ],
      providers: [
        MakePaymentService,
        PaymentService,
        { provide: ActivatedRoute, useValue: { paramMap: of(PARAM_MAP) } },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    TestBed.inject(Platform).ready();
    CsaaAppInjector.injector = TestBed.inject(Injector);

    beforeComponentCreate && beforeComponentCreate.call(beforeComponentCreate);

    alertControllerMock = TestBed.inject(AlertController) as any;

    fixture = TestBed.createComponent(AutopaySettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', () => {
    setupComponent();
    expect(component).toBeTruthy();
  });

  it('should match snapshot with Autopay off', () => {
    setupComponent();
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot with Autopay on', () => {
    setupComponent(setAutopayOn);
    expect(fixture).toMatchSnapshot();
  });

  describe('Show eValue Discount Alert when deactivating Autopay while enrolled in eValue', function () {
    [EValueEnrollmentStatus.ACTIVE, EValueEnrollmentStatus.PENDING].forEach((status) => {
      it(`should alert when enrollment status is ${EValueEnrollmentStatus[status]}`, async () => {
        setupComponent(() => setAutopayOnWithEValue(status));
        await component.deactivateAutoPay();
        fixture.detectChanges();
        expect(fixture).toMatchSnapshot();

        expect(alertControllerMock.create).toHaveBeenCalled();

        const alertInstance = alertControllerMock.getTop();
        expect(alertInstance).toBeTruthy();
        expect(alertInstance?.options?.header).toBe('eValue Discount Alert');
        expect(alertInstance?.options?.subHeader).toBe(
          'Cancellation of AutoPay withdrawals will result in the removal of your eValue discount.  Do you wish to continue?'
        );
      });
    });

    it(`should proceed when enrollment status is not ACTIVE nor PENDING`, async () => {
      setupComponent(() => setAutopayOnWithEValue(null));
      const paymentService = TestBed.inject(PaymentService);
      paymentService.unEnrollPolicyForAutopay = jest.fn().mockReturnValue(of(true));
      await component.deactivateAutoPay();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();

      expect(alertControllerMock.create).not.toHaveBeenCalled();
      const alertInstance = alertControllerMock.getTop();
      expect(alertInstance).toBeFalsy();

      expect(paymentService.unEnrollPolicyForAutopay).toHaveBeenCalled();
    });
  });

  describe('Show eValue Discount Alert when activating Autopay with Credit Card while enrolled in eValue', function () {
    [EValueEnrollmentStatus.ACTIVE, EValueEnrollmentStatus.PENDING].forEach((status) => {
      it(`should alert when enrollment status is ${EValueEnrollmentStatus[status]}`, async () => {
        setupComponent(() => setAutopayOnWithEValue(status));
        component.selectedPaymentAccount = CREDIT_CARD;

        await component.activateAutoPay();
        fixture.detectChanges();
        expect(fixture).toMatchSnapshot();

        expect(alertControllerMock.create).toHaveBeenCalled();

        const alertInstance = alertControllerMock.getTop();
        expect(alertInstance).toBeTruthy();
        expect(alertInstance?.options?.header).toBe('eValue Discount Alert');
        expect(alertInstance?.options?.subHeader).toBe(
          'You are currently receiving the eValue discount and must pay with a Checking/Savings or Debit Card account.  If you switch to a credit card, the eValue discount will be removed.  Do you wish to proceed?'
        );
      });
    });

    [EValueEnrollmentStatus.ACTIVE, EValueEnrollmentStatus.PENDING].forEach((status) => {
      it(`should proceed if selected payment account is not Credit Card when enrollment status is ${EValueEnrollmentStatus[status]}`, async () => {
        setupComponent(() => setAutopayOnWithEValue(status));
        component.selectedPaymentAccount = DEBIT_CARD;

        const paymentService = TestBed.inject(PaymentService);
        paymentService.enrollPolicyForAutopay = jest.fn().mockReturnValue(of(true));
        await component.activateAutoPay();
        fixture.detectChanges();
        expect(fixture).toMatchSnapshot();

        expect(alertControllerMock.create).not.toHaveBeenCalled();
        const alertInstance = alertControllerMock.getTop();
        expect(alertInstance).toBeFalsy();

        expect(paymentService.enrollPolicyForAutopay).toHaveBeenCalled();
      });
    });
  });
});
