import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  Policy,
  PaymentHistory,
  PaymentHistoryEntry,
  PaymentStatus,
  PaymentMethod,
} from '../../../../_core/interfaces';

@Component({
  selector: 'csaa-payment-history-card',
  templateUrl: 'csaa-payment-history-card.component.html',
  styleUrls: ['csaa-payment-history-card.component.scss'],
})
export class CsaaPaymentHistoryCardComponent implements OnChanges {
  @Input() policy: Policy;
  @Input() loading = false;
  @Input() headerLine = 'full';
  @Input() history: PaymentHistory;
  @Input() timezone: string = undefined;

  paymentHistory: PaymentHistoryEntry[];
  status = PaymentStatus;

  ngOnChanges(changes: SimpleChanges) {
    const historyIn =
      changes.history &&
      changes.history.currentValue &&
      Object.keys(changes.history.currentValue) &&
      Object.keys(changes.history.currentValue).length > 0;
    if (historyIn && this.policy && this.policy.number) {
      this.paymentHistory = changes.history.currentValue[this.policy.number].slice(0, 4);
    }
  }

  getPaymentStatus(paymentStatus): PaymentStatus {
    const status = paymentStatus ? paymentStatus.toLowerCase() : '';
    switch (status) {
      case 'issued':
        return PaymentStatus.PAID;
      case 'pending':
        return PaymentStatus.PENDING;
      default:
        return PaymentStatus.FAILED;
    }
  }

  getPaymentMethod(paymentMethod): PaymentMethod {
    const method = paymentMethod ? paymentMethod.toLowerCase() : '';
    switch (method) {
      case 'cash':
        return PaymentMethod.CASH;
      case 'cheque':
        return PaymentMethod.CHECK;
      case 'creditcard':
      case 'pcicreditcard':
        return PaymentMethod.CREDIT_CARD;
      case 'debitcard':
      case 'pcidebitcard':
        return PaymentMethod.DEBIT_CARD;
      case 'eft':
        return PaymentMethod.EFT;
      default:
        return PaymentMethod.EMPTY;
    }
  }
}
