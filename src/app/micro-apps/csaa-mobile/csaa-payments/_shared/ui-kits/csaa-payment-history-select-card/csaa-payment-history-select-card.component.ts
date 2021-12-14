import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Policy, PolicyType, EventName, Category, EventType } from '../../../../_core/interfaces';
import { AnalyticsService } from '../../../../_core/services';

@Component({
  selector: 'csaa-select-policy-card',
  templateUrl: 'csaa-payment-history-select-card.component.html',
})
export class CsaaPaymentHistorySelectCardComponent {
  @Input() policies: Policy[] = [];
  @Input() loading = false;
  @Output() policyClick = new EventEmitter<Policy>();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  constructor(private analyticsService: AnalyticsService) {}

  handlePolicyClick(policy: Policy) {
    this.analyticsService.trackEvent(EventName.PAYMENT_HISTORY_ACCESSED, Category.payments, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Payment History',
      ...AnalyticsService.mapPolicy(policy),
    });
    this.policyClick.emit(policy);
  }
}
