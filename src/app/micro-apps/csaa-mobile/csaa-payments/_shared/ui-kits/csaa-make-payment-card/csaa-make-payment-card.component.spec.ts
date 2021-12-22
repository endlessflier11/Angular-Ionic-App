import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { By } from '../../../../../../../testing';
import { EMPLOYEE_SEARCH } from '../../../../../../../testing/fixtures/make-payments-page/employee-search.fixture';
import { MAKE_PAYMENT_METHOD } from '../../../../../../../testing/fixtures/make-payments-page/make-payments-page.fixture';
import { PageTestingModule } from '../../../../../../../testing/misc/page-testing.module';
import { PaymentType } from '../../../../_core/interfaces/payment.interface';
import { PolicyType } from '../../../../_core/interfaces/policy.interface';
import DateHelper from '../../../../_core/shared/date.helper';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaMakePaymentCardComponent } from './csaa-make-payment-card.component';

describe('CsaaMakePaymentCardComponent', () => {
  const DATE_NOW = Date.parse('2021-01-01');
  let component: CsaaMakePaymentCardComponent;
  let fixture: ComponentFixture<CsaaMakePaymentCardComponent>;

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockReturnValue(DATE_NOW);
    TestBed.configureTestingModule({
      declarations: [CsaaMakePaymentCardComponent],
      imports: [
        CommonModule,
        IonicModule,
        UiKitsModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesAnalytics: true,
          providesConfig: true,
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CsaaMakePaymentCardComponent);
    component = fixture.componentInstance;
    const tzOffset = new Date().getTimezoneOffset() / 60;
    component.timezone =
      (tzOffset > 0 ? '-' : '+') + tzOffset.toString().padStart(2, '0').padEnd(4, '0');

    component.paymentMethod = MAKE_PAYMENT_METHOD;
    component.customerSearch = EMPLOYEE_SEARCH;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.spyOn(Date, 'now').mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshots when payment is due', () => {
    component.payment = {
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
      isPaymentDue: true,
      amount: 148.1,
      policyRiskState: 'test',
      autopayEnrollment: null,
    };
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('should match snapshots when payment is overdue', () => {
    component.payment = {
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
    };
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('it should display selectAmountClick when clicking on card details', () => {
    component.payment = {
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
      isPaymentDue: true,
      amount: 148.1,
      policyRiskState: 'test',
      autopayEnrollment: null,
    };
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.csaa-payment-amount-list-item'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('it should display selectPaymentClick when clicking on card details', () => {
    component.payment = {
      vehicles: ['Toyota Prius'],
      subtitle: 'test',
      autoPay: false,
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
      isPaymentDue: true,
      amount: 148.1,
      policyRiskState: 'test',
      autopayEnrollment: null,
    };
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.csaa-payment-method-list-item'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('it should display autopay when clicking on card details', () => {
    component.payment = {
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
      isPaymentDue: true,
      amount: 148.1,
      policyRiskState: 'test',
      autopayEnrollment: null,
    };
    fixture.detectChanges();
    const autoPayButton = fixture.debugElement.query(By.css('.csaa-payment-autopay-item'));
    expect(autoPayButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('it should click on the make a payment button', () => {
    component.payment = {
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
      isPaymentDue: true,
      amount: 148.1,
      policyRiskState: 'test',
      autopayEnrollment: null,
    };
    fixture.detectChanges();
    const makeAPaymentButton = fixture.debugElement.query(
      By.cssAndText('ion-button', 'Make a Payment')
    );
    expect(makeAPaymentButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
