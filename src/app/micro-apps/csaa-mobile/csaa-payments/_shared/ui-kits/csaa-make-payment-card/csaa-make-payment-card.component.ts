import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  UpcomingPayment,
  CustomerSearchResponse,
  PaymentAccount,
  PolicyType,
  AutoPayEnrollmentResponse,
  EventName,
  Category,
  EventType,
} from '../../../../_core/interfaces';
import { PaymentHelper } from '../../../../_core/shared/payment.helper';
import { AnalyticsService, RouterService } from '../../../../_core/services';
import { noop } from '../../../../_core/helpers';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'csaa-make-payment-card',
  templateUrl: 'csaa-make-payment-card.component.html',
  styleUrls: ['csaa-make-payment-card.component.scss'],
})
export class CsaaMakePaymentCardComponent implements OnChanges {
  @Input() paymentSucceeded = false;
  @Input() timezone: string = undefined;
  @Input() payment: UpcomingPayment;
  @Input() customerSearch: CustomerSearchResponse;
  @Input() loading = false;
  @Input() paymentMethod: PaymentAccount;
  @Input() otherAmount: number;
  @Input() autopayEnrollment: AutoPayEnrollmentResponse;

  @Output() selectAmountClick = new EventEmitter<UpcomingPayment>();
  @Output() selectPaymentClick = new EventEmitter<UpcomingPayment>();
  @Output() makePaymentClick = new EventEmitter<UpcomingPayment>();
  policyTypeIcon: string;

  constructor(
    private readonly routerService: RouterService,
    private readonly alertCtrl: AlertController,
    private readonly analyticsService: AnalyticsService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.payment && changes.payment.currentValue) {
      this.getPolicyTypeIconPath(this.payment.policyType);
    }
  }

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

  getPolicyTypeIconPath(policyType: PolicyType): void {
    switch (policyType) {
      case PolicyType.PUP:
        this.policyTypeIcon = '/assets/csaa-mobile/vectors/icn-PUP.svg';
        break;
      case PolicyType.Auto:
        this.policyTypeIcon = '/assets/csaa-mobile/vectors/icn-Auto.svg';
        break;
    }
  }

  getAutopayInfo() {
    return PaymentHelper.getAutopayEnrollmentLabel(this.autopayEnrollment);
  }

  async goToAutopaySettings() {
    if (!this.isOverdue()) {
      return this.routerService
        .navigateForward('csaa.payment.autopay.settings', {
          policyNumber: this.payment.policyNumber,
        })
        .then(noop);
    }

    this.analyticsService.trackEvent(EventName.AUTOPAY_ENROLLMENT_STOPPED, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      ...AnalyticsService.mapPaymentPolicy(this.payment),
    });
    const alert = await this.alertCtrl.create({
      header: 'Unable to Proceed',
      message:
        'We are unable to process your AutoPay enrollment request due to a past due balance on your account.' +
        ' To continue, you will need to make a payment on your account.',
      buttons: ['OK'],
    });
    return await alert.present();
  }
}
