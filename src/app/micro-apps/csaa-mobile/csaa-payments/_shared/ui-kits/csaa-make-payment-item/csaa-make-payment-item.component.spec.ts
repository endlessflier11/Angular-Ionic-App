import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsaaMakePaymentItemComponent } from './csaa-make-payment-item.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { PaymentAccountType, PaymentType, PolicyType } from '../../../../_core/interfaces';
import DateHelper from '../../../../_core/shared/date.helper';
import { By, clickEvent } from '@app/testing';
import { MAKE_PAYMENT_METHOD } from '../../../../../../../testing/fixtures/make-payments-page/make-payments-page.fixture';
import { EMPLOYEE_SEARCH } from '../../../../../../../testing/fixtures/make-payments-page/employee-search.fixture';

function createPaymentMock() {
  return {
    vehicles: ['Toyota Prius'],
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
    dueDate: DateHelper.toDate('2040-08-19'),
    isPastDue: false,
    isPaymentDue: false,
    amount: 148.1,
    policyRiskState: 'test',
    autopayEnrollment: {
      enrollmentRecord: {
        receiptNumber: '755736',
        action: 'ENROLL',
        authenticationChannel: null,
        sourceApplicationUsed: 'EZPAY',
        lastUpdatedBy: 'mobile_app_user',
        lastUpdatedOn: '2021-10-22T07:26:05.757-07:00',
        lastUpdatedWorkstationIP: '127.0.0.1',
        billingSystemUpdateStatus: 'POST',
        enrollmentEffectiveDate: '2021-10-22',
        paymentItem: {
          paymentMethod: PaymentAccountType.CARD,
          type: 'INST',
          paymentAccountToken: '0AC5D0B0-5383-BBB2-6EF6-0E7C35B81E7D',
          card: {
            number: '5454',
            type: 'MASTR',
            printedName: 'TEST USER',
            expirationDate: '2025-12-01',
            isCardPresent: false,
            zipCode: null,
          },
          account: null,
        },
      },
      policyNumber: 'AZAC910055047',
      dataSource: 'PAS',
      policyType: 'PA',
      autoPay: true,
    },
  };
}

describe('CsaaMakePaymentItemComponent', () => {
  const DATE_NOW = Date.parse('2021-01-01');
  let component: CsaaMakePaymentItemComponent;
  let fixture: ComponentFixture<CsaaMakePaymentItemComponent>;

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockReturnValue(DATE_NOW);
    await TestBed.configureTestingModule({
      imports: [CommonModule, IonicModule, UiKitsModule],
      declarations: [CsaaMakePaymentItemComponent],
    }).compileComponents();
  });
  afterEach(() => {
    jest.spyOn(Date, 'now').mockRestore();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsaaMakePaymentItemComponent);
    component = fixture.componentInstance;
    component.paymentMethod = MAKE_PAYMENT_METHOD;
    component.customerSearch = EMPLOYEE_SEARCH;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshots when payment is due', () => {
    component.payment = createPaymentMock();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('should match snapshots when payment is overdue', () => {
    component.payment = {
      ...createPaymentMock(),
      vehicles: ['Lexus NX', 'BMW X1'],
      isPastDue: true,
      isPaymentDue: true,
    };

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshots when autopay is off', () => {
    component.payment = { ...createPaymentMock(), autoPay: false, autopayEnrollment: null };

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should have an Auto Pay button', () => {
    component.payment = createPaymentMock();
    fixture.detectChanges();
    const autoPayButton = fixture.debugElement.query(By.css('[data-test=button-autopay]'));
    expect(autoPayButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit autoPayClick event when AutoPay button clicked', () => {
    component.payment = { ...createPaymentMock(), isPastDue: false, isPaymentDue: true };
    component.autoPayClick = { emit: jest.fn() } as any;
    fixture.detectChanges();

    const autopayButton = fixture.debugElement.query(By.css('[data-test=button-autopay]'));
    expect(autopayButton).toBeTruthy();

    autopayButton.triggerEventHandler('click', clickEvent);

    expect(component.autoPayClick.emit).toHaveBeenCalled();

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should have a Pay Now button', () => {
    component.payment = { ...createPaymentMock(), isPastDue: false, isPaymentDue: true };
    fixture.detectChanges();

    const makeAPaymentButton = fixture.debugElement.query(By.css('[data-test=button-pay-now]'));
    expect(makeAPaymentButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit payNowClick event when Pay Now button clicked', () => {
    component.payment = { ...createPaymentMock(), isPastDue: false, isPaymentDue: true };
    component.payNowClick = { emit: jest.fn() } as any;
    fixture.detectChanges();

    const payNowButton = fixture.debugElement.query(By.css('[data-test=button-pay-now]'));
    expect(payNowButton).toBeTruthy();

    payNowButton.triggerEventHandler('click', clickEvent);

    expect(component.payNowClick.emit).toHaveBeenCalled();

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
