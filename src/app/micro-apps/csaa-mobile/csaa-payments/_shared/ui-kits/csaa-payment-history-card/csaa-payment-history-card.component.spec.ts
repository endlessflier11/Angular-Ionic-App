import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { By } from '../../../../../../../testing';
import { PageTestingModule } from '../../../../../../../testing/misc/page-testing.module';
import { PaymentHistory } from '../../../../_core/interfaces/payment.interface';
import { Policy, PolicyStatus } from '../../../../_core/interfaces/policy.interface';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentHistoryCardComponent } from './csaa-payment-history-card.component';

describe('CsaaPaymentHistoryCardComponent', () => {
  let component: CsaaPaymentHistoryCardComponent;
  let fixture: ComponentFixture<CsaaPaymentHistoryCardComponent>;
  const mockPolicyNumber = '12345';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CsaaPaymentHistoryCardComponent],
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
    });

    const mockHistory: PaymentHistory = {
      [mockPolicyNumber]: [
        {
          transactionDate: '2018-08-10',
          amount: '148.1',
          status: 'paid',
          paymentMethod: 'creditcard',
          policyEffectiveDate: '2018-08-10',
          policyExpirationDate: '2018-08-10',
          referenceNumber: '1',
          subType: 'string',
          userID: '1',
        },
        {
          transactionDate: '2018-08-10',
          amount: '148.1',
          status: 'pending',
          paymentMethod: 'creditcard',
          policyEffectiveDate: '2018-08-10',
          policyExpirationDate: '2018-08-10',
          referenceNumber: '1',
          subType: 'string',
          userID: '1',
        },
        {
          transactionDate: '2018-08-10',
          amount: '148.1',
          status: 'failed',
          paymentMethod: 'creditcard',
          policyEffectiveDate: '2018-08-10',
          policyExpirationDate: '2018-08-10',
          referenceNumber: '1',
          subType: 'string',
          userID: '1',
        },
        {
          transactionDate: '2018-08-10',
          amount: '148.1',
          status: 'paid',
          paymentMethod: 'creditcard',
          policyEffectiveDate: '2018-08-10',
          policyExpirationDate: '2018-08-10',
          referenceNumber: '1',
          subType: 'string',
          userID: '1',
        },
        {
          transactionDate: '2018-08-10',
          amount: '148.1',
          status: 'paid',
          paymentMethod: 'creditcard',
          policyEffectiveDate: '2018-08-10',
          policyExpirationDate: '2018-08-10',
          referenceNumber: '1',
          subType: 'string',
          userID: '1',
        },
        {
          transactionDate: '2018-08-10',
          amount: '148.1',
          status: 'paid',
          paymentMethod: 'creditcard',
          policyEffectiveDate: '2018-08-10',
          policyExpirationDate: '2018-08-10',
          referenceNumber: '1',
          subType: 'string',
          userID: '1',
        },
      ],
    };

    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: mockPolicyNumber,
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };

    fixture = TestBed.createComponent(CsaaPaymentHistoryCardComponent);
    component = fixture.componentInstance;
    component.history = mockHistory;
    component.policy = mockPolicy;
    component.ngOnChanges({ history: new SimpleChange(null, mockHistory, false) });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot when loading and no payments', () => {
    component.loading = true;
    expect(fixture).toMatchSnapshot();
  });

  it('should only show the last 4 payments', () => {
    expect(fixture.debugElement.queryAll(By.cssAndText('ion-item', 'Credit Card')).length).toBe(4);
  });
});
