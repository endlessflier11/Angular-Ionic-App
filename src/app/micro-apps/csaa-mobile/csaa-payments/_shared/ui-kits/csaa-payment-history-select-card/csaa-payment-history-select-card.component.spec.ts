import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { generatePolicy, PageTestingModule } from '../../../../../../../testing';
import { Category, EventName, Policy } from '../../../../_core/interfaces';
import { AnalyticsService } from '../../../../_core/services';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentHistorySelectCardComponent } from './csaa-payment-history-select-card.component';

describe('CsaaPaymentHistoryCardComponent', () => {
  let policy: Policy;
  let component: CsaaPaymentHistorySelectCardComponent;
  let fixture: ComponentFixture<CsaaPaymentHistorySelectCardComponent>;
  let analyticService;

  beforeEach(async () => {
    try {
      TestBed.configureTestingModule({
        declarations: [CsaaPaymentHistorySelectCardComponent],
        imports: [
          CommonModule,
          IonicModule,
          UiKitsModule,
          PageTestingModule.withConfig({
            providesAnalytics: true,
            providesStorage: true,
            providesConfig: true,
          }),
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      policy = generatePolicy({
        vehicles: [
          {
            id: 'WAUKJAFM8AA061319',
            name: 'Lamborghini Gallardo',
            coverages: [],
            riskFactors: { waivedLiability: true },
          },
          {
            id: 'WMWZC3C51EWP29276',
            name: 'Aston Martin DB9',
            coverages: [],
            riskFactors: { waivedLiability: false },
          },
        ],
      });

      analyticService = TestBed.inject(AnalyticsService);
      fixture = TestBed.createComponent(CsaaPaymentHistorySelectCardComponent);
      component = fixture.componentInstance;
      component.policies = [policy];
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track the handle policy click', () => {
    component.handlePolicyClick(policy);
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.TRANSACTION_HISTORY_ACCESSED,
      Category.payments,
      {
        policies: [
          {
            policy_number: '1',
            policy_state: undefined,
            policy_type: 'Auto',
          },
        ],
        event_type: 'Link Accessed',
        link: 'Payment History',
      }
    );
  });
});
