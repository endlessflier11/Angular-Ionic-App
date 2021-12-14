import { Component, Input, OnInit } from '@angular/core';
import { AnalyticsService, CsaaTheme, RouterService } from '../../../../_core/services';
import { noop } from 'rxjs';
import {
  Category,
  EventName,
  EventType,
  PaymentAccount,
  Policy,
  UpcomingPayment,
} from '../../../../_core/interfaces';
import { ConfigState } from '../../../../_core/store/states/config.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'csaa-autopay-discount-card',
  templateUrl: './autopay-discount-card.component.html',
  styleUrls: ['./autopay-discount-card.component.scss'],
})
export class AutopayDiscountCardComponent implements OnInit {
  @Input() policy: Policy;
  @Input() navigate: boolean;
  @Input() payment: UpcomingPayment;
  @Input() paymentAccount: PaymentAccount;
  currentTheme: CsaaTheme;
  isOpen = false;

  public get policyNumber(): string {
    return this.policy?.number;
  }

  public get discountDataDiff(): number {
    if (!this.payment || !this.payment?.autopayInstallmentFee) {
      return null;
    }
    const { autoPayFees, otpFees } = this.payment?.autopayInstallmentFee;
    const lowestAutopayFee = Math.min(
      autoPayFees.eft,
      autoPayFees.pciDebitCard,
      autoPayFees.pciCreditCard
    );
    const highestOTPFee = Math.max(otpFees.eft, otpFees.pciDebitCard, otpFees.pciCreditCard);
    return highestOTPFee - lowestAutopayFee;
  }

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  public clickHandler(): void {
    if (!this.navigate) {
      this.toggle();
    } else {
      this.analyticsService.trackEvent(EventName.SAVE_WITH_AUTOPAY_SELECTED, Category.payments, {
        event_type: EventType.LINK_ACCESSED,
        ...AnalyticsService.mapPolicy(this.policy),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        potential_savings: this.discountDataDiff,
      });
      this.routerService
        .navigateForward('csaa.payment.autopay.settings', { policyNumber: this.policyNumber })
        .then(noop);
    }
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.analyticsService.trackEvent(
        EventName.AUTOPAY_INSTALLMENT_TABLE_EXPANDED,
        Category.payments,
        {
          event_type: EventType.UX_MODIFIED,
          ...AnalyticsService.mapPolicy(this.policy),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          potential_savings: this.discountDataDiff,
        }
      );
    }
  }
}
