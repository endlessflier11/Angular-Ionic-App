import { Component, Input } from '@angular/core';
import { Policy, PolicyPaymentResult, UpcomingPayment } from '../../../../_core/interfaces';

@Component({
  selector: 'csaa-payment-succeeded-card',
  templateUrl: 'csaa-payment-succeeded-card.component.html',
  styleUrls: ['csaa-payment-succeeded-card.scss'],
})
export class CsaaPaymentSucceededCardComponent {
  @Input() policy: Policy;
  @Input() payment: UpcomingPayment;
  @Input() loading = false;
  @Input() result: PolicyPaymentResult;
}
