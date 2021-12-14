import { Component, Input } from '@angular/core';
import { UpcomingPayment } from '../../_core/interfaces/payment.interface';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { noop } from 'rxjs';
import { AnalyticsService, RouterService } from '../../_core/services';

@Component({
  selector: 'csaa-payments-card',
  templateUrl: './payments-card.component.html',
  styleUrls: ['./payments-card.component.scss'],
})
export class PaymentsCardComponent {
  @Input() payments: UpcomingPayment[] = [];
  @Input() loading = false;
  @Input() timezone: string = undefined;

  constructor(
    private readonly routerService: RouterService,
    private analyticsService: AnalyticsService
  ) {}

  get hasOverduePayments(): boolean {
    return this.payments && this.payments.some(this.isOverdue);
  }

  isOverdue(payment: UpcomingPayment): boolean {
    return payment.isPastDue;
  }

  openPaymentsPage() {
    const [payment] = this.payments;
    this.analyticsService.trackEvent(EventName.PAYMENTS_ACCESSED, Category.payments, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Payments',
      ...AnalyticsService.mapPaymentPolicy(payment),
    });
    this.routerService.navigateForward('csaa.payment.index').then(noop);
  }
}
