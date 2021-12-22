import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AutoPayEnrollmentResponse,
  CustomerSearchResponse,
  PaymentAccount,
  UpcomingPayment,
} from '../../../../_core/interfaces';
import { PaymentHelper } from '../../../../_core/shared/payment.helper';

@Component({
  selector: 'csaa-make-payment-item',
  templateUrl: './csaa-make-payment-item.component.html',
  styleUrls: ['./csaa-make-payment-item.component.scss'],
})
export class CsaaMakePaymentItemComponent {
  @Input() paymentSucceeded = false;
  @Input() timezone: string = undefined;
  @Input() payment: UpcomingPayment;
  @Input() customerSearch: CustomerSearchResponse;
  @Input() loading = false;
  @Input() paymentMethod: PaymentAccount;
  @Input() otherAmount: number;
  @Input() autopayEnrollment: AutoPayEnrollmentResponse;

  @Output() payNowClick = new EventEmitter<UpcomingPayment>();
  @Output() autoPayClick = new EventEmitter<UpcomingPayment>();

  hasRegId() {
    if (
      this.customerSearch &&
      this.customerSearch.registrations &&
      this.customerSearch.registrations.length > 0
    ) {
      if (this.customerSearch.registrations.filter((reg) => reg.registrationId).length > 0) {
        return true;
      }
    }
    return false;
  }

  isOverdue(): boolean {
    if (!this.payment) {
      return false;
    }

    return this.payment.isPastDue;
  }

  getAutopayInfo() {
    return PaymentHelper.getAutopayEnrollmentLabel(this.autopayEnrollment);
  }
}
