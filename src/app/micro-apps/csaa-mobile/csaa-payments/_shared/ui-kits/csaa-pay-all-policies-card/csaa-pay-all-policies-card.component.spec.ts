import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { By } from '../../../../../../../testing';
import { PageTestingModule } from '../../../../../../../testing/misc/page-testing.module';
import { Category, EventName, PolicyType } from '../../../../_core/interfaces';
import { PaymentType } from '../../../../_core/interfaces/payment.interface';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import DateHelper from '../../../../_core/shared/date.helper';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaPayAllPoliciesCardComponent } from './csaa-pay-all-policies-card.component';

describe('CsaaPayAllPoliciesCardComponent', () => {
  let component: CsaaPayAllPoliciesCardComponent;
  let fixture: ComponentFixture<CsaaPayAllPoliciesCardComponent>;
  let analyticsService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CsaaPayAllPoliciesCardComponent],
      imports: [
        CommonModule,
        IonicModule,
        UiKitsModule,
        PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    analyticsService = TestBed.inject(AnalyticsService);
    fixture = TestBed.createComponent(CsaaPayAllPoliciesCardComponent);
    component = fixture.componentInstance;
    component.timezone = '+0000';
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshots when payment is autoPay and there are overdue payments', () => {
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

    component.payments = payments;
    component.ngOnChanges({ payments: { currentValue: payments } } as any as SimpleChanges);
    fixture.detectChanges();
    component.paymentSucceeded = false;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('it should display selectAmountClick when clicking on card details', () => {
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
        dueDate: DateHelper.toDate('2021-08-10'),
        isPastDue: false,
        isPaymentDue: false,
        amount: 260.75,
        policyRiskState: 'test',
        autopayEnrollment: null,
      },
    ];
    component.payments = payments;
    component.ngOnChanges({ payments: { currentValue: payments } } as any as SimpleChanges);

    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.csaa-payment-amount-list-item'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('it should display selectPaymentClick when clicking on card details', () => {
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
        dueDate: DateHelper.toDate('2021-08-10'),
        isPastDue: false,
        isPaymentDue: false,
        amount: 260.75,
        policyRiskState: 'test',
        autopayEnrollment: null,
      },
    ];
    component.payments = payments;
    component.ngOnChanges({ payments: { currentValue: payments } } as any as SimpleChanges);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.csaa-payment-method-list-item'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should track the make payment button', () => {
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
        dueDate: DateHelper.toDate('2021-08-10'),
        isPastDue: false,
        isPaymentDue: false,
        amount: 260.75,
        policyRiskState: 'test',
        autopayEnrollment: null,
      },
    ];
    component.payments = payments;
    component.ngOnChanges({ payments: { currentValue: payments } } as any as SimpleChanges);
    fixture.detectChanges();
    component.makePayment();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.PAY_ALL_SELECTED,
      Category.payments,
      {
        event_type: 'Option Selected',
        selection: 'Pay All',
        amount_due: component.amount,
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
  it('it should match snapshots right after submitting a successful payment', () => {
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
        dueDate: DateHelper.toDate('2021-08-10'),
        isPastDue: false,
        isPaymentDue: false,
        amount: 260.75,
        policyRiskState: 'test',
        autopayEnrollment: null,
      },
    ];
    component.payments = payments;
    component.ngOnChanges({ payments: { currentValue: payments } } as any as SimpleChanges);
    fixture.detectChanges();
    component.paymentSucceeded = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
