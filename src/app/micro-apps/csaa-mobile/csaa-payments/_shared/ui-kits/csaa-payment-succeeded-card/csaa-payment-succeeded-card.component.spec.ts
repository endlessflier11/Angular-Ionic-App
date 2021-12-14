import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PageTestingModule } from '../../../../../../../testing';
import { PaymentType } from '../../../../_core/interfaces/payment.interface';
import { PolicyType } from '../../../../_core/interfaces/policy.interface';
import DateHelper from '../../../../_core/shared/date.helper';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentSucceededCardComponent } from './csaa-payment-succeeded-card.component';
import { AutopayDiscountCardComponent } from '../autopay-discount-card/autopay-discount-card.component';

describe('CsaaPaymentSelectModal', () => {
  let component: CsaaPaymentSucceededCardComponent;
  let fixture: ComponentFixture<CsaaPaymentSucceededCardComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CsaaPaymentSucceededCardComponent, AutopayDiscountCardComponent],
      imports: [
        CommonModule,
        IonicModule,
        UiKitsModule,
        PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
      ],
      providers: [],
    });

    fixture = TestBed.createComponent(CsaaPaymentSucceededCardComponent);
    component = fixture.componentInstance;

    component.payment = component.payment = {
      vehicles: ['Toyota Prius'],
      subtitle: 'test',
      autoPay: false,
      minimumAmount: 20,
      remainingPremium: 10000,
      otherAmount: 1023.45,
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
    component.result = {
      result: true,
      receiptNumber: '1668324',
      paymentAccount: {
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
      },
      amount: 1023.45,
      date: '2021-04-09',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshots', () => {
    expect(fixture).toMatchSnapshot();
  });
});
