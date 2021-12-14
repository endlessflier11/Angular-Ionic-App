import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { PaymentsCardComponent } from './payments-card.component';
import { PageTestingModule } from '@app/testing';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { CsaaPaymentsUiKitsModule } from '../../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { Category, EventName, PaymentType, PolicyType } from '../../_core/interfaces';
// import { AnalyticsMockService } from '../../../../../testing/services/analytics-mock.service';
import DateHelper from '../../_core/shared/date.helper';
import { RouterService } from '../../_core/services';
// import { RouterService } from '../../_core/services';

describe('PaymentsCardComponent', () => {
  let component: PaymentsCardComponent;
  let fixture: ComponentFixture<PaymentsCardComponent>;
  let analyticsService: AnalyticsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentsCardComponent],
      providers: [
        {
          provide: RouterService,
          useValue: {
            navigateForward: jest.fn().mockResolvedValue({}),
          },
        },
      ],
      imports: [
        PageTestingModule.withConfig({
          providesStorage: true,
          providesRouter: true,
          providesAnalytics: true,
        }),
        CsaaCoreModule.forRoot(),
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
      ],
    }).compileComponents();

    analyticsService = TestBed.inject(AnalyticsService);
    fixture = TestBed.createComponent(PaymentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should track open payments page', () => {
    component.payments = [
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

    component.openPaymentsPage();

    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.PAYMENTS_ACCESSED,
      Category.payments,
      {
        event_type: 'Link Accessed',

        link: 'Payments',
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
});
