import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  Category,
  EventName,
  EventType,
  PaymentAccount,
  PaymentType,
  UpcomingPayment,
  UpcomingPaymentModel,
} from '../../../../_core/interfaces';
import { AnalyticsService, parseToCent } from '../../../../_core/services';

@Component({
  selector: 'csaa-pay-all-policies-card',
  templateUrl: 'csaa-pay-all-policies-card.component.html',
  styleUrls: ['csaa-pay-all-policies-card.component.scss'],
})
export class CsaaPayAllPoliciesCardComponent implements OnChanges {
  @Input() paymentSucceeded = false;
  @Input() timezone: string = undefined;
  @Input() payments: UpcomingPayment[];
  @Input() paymentMethod: PaymentAccount;
  @Input() disabled = false;
  @Input() loading = false;

  @Output() selectAmountClick = new EventEmitter<UpcomingPayment>();
  @Output() selectPaymentClick = new EventEmitter<UpcomingPayment>();
  @Output() makePaymentClick = new EventEmitter<UpcomingPayment>();

  public combinedPayment: UpcomingPayment;
  public hasOverDuePayment: boolean;

  constructor(private readonly analyticsService: AnalyticsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes &&
      changes.payments &&
      changes.payments.currentValue &&
      changes.payments.currentValue.length > 0
    ) {
      this.hasOverDuePayment = this.checkForOverDuePayment();
      this.combinedPayment = this.createPayment();
    }
  }

  createPayment() {
    const combinedPayment = Object.assign({}, this.payments[0]);
    combinedPayment.allPolicies = true;
    combinedPayment.policyNumber = 'ALL';
    combinedPayment.minimumAmount = 0;
    combinedPayment.remainingPremium = 0;

    this.payments.forEach((currentPayment) => {
      if (currentPayment.remainingPremium > 0) {
        combinedPayment.remainingPremium += parseToCent(currentPayment.remainingPremium);
      }

      if (currentPayment.minimumAmount > 0) {
        combinedPayment.minimumAmount += parseToCent(currentPayment.minimumAmount);
      }
    });

    // Revert from cent since we completed calculation
    combinedPayment.minimumAmount = combinedPayment.minimumAmount / 100;
    combinedPayment.remainingPremium = combinedPayment.remainingPremium / 100;

    return new UpcomingPaymentModel(combinedPayment);
  }

  get remaining() {
    return this.combinedPayment.remainingPremium;
  }

  get amount() {
    return this.combinedPayment.amount;
  }

  checkForOverDuePayment(): boolean {
    return this.payments
      ? !!this.payments.find((payment: UpcomingPayment) => payment.isPaymentDue)
      : false;
  }

  setPaymentAmountType(type: PaymentType): void {
    this.combinedPayment.type = type;
  }

  selectAmount(): void {
    this.selectAmountClick.emit(this.combinedPayment);
  }

  selectPayment(): void {
    this.selectPaymentClick.emit(this.combinedPayment);
  }

  makePayment() {
    this.analyticsService.trackEvent(EventName.PAY_ALL_SELECTED, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Pay All',
      amount_due: this.amount,
      ...AnalyticsService.mapPaymentPolicy(...this.payments),
    });
    this.makePaymentClick.emit(this.combinedPayment);
  }

  isButtonDisabled() {
    return (
      this.disabled ||
      !this.amount ||
      !this.paymentMethod ||
      (this.paymentMethod.card && this.paymentMethod.card.expired) ||
      this.amount < 0
    );
  }
}
