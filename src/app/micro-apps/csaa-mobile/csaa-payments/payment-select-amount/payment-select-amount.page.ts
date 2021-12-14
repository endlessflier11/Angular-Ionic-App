import { Component, OnInit } from '@angular/core';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController, Platform } from '@ionic/angular';
import { noop } from 'rxjs';
import {
  IonViewWillEnter,
  UpcomingPayment,
  PolicyType,
  EventName,
  Category,
  EventType,
} from '../../_core/interfaces';
import { ConfigService, RouterService, AnalyticsService } from '../../_core/services';
import { PaymentState } from '../../_core/store/states/payment.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-csaa-payment-select-amount',
  templateUrl: './payment-select-amount.page.html',
  styleUrls: ['./payment-select-amount.page.scss'],
})
export class PaymentSelectAmountPage implements OnInit, IonViewWillEnter {
  currentTheme: string;

  amountForm: FormGroup;
  paymentData: UpcomingPayment;
  payments: UpcomingPayment[];
  isIos: boolean;

  public get otherAmountMaskConfig() {
    return {
      money: true,
      numberAndTousand: true,
      thousand: ',',
      decimal: 2,
      decimalCaracter: '.',
    };
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly routerService: RouterService,
    private readonly makePaymentService: MakePaymentService,
    private readonly formBuilder: FormBuilder,
    private readonly platform: Platform,
    private readonly alertCtrl: AlertController,
    private readonly analyticsService: AnalyticsService,
    private readonly store: Store
  ) {
    this.currentTheme = this.configService.getTheme();

    if (!makePaymentService.hasPayment) {
      this.navigateBack();
    }
    this.amountForm = this.formBuilder.group({
      otherAmount: [''],
    });
  }

  ngOnInit() {}

  ionViewWillEnter(): void {
    this.payments = this.store.selectSnapshot(PaymentState.upcomingPayments);

    this.paymentData = this.makePaymentService.getActivePayment();
    if (this.paymentData && !this.paymentData.allPolicies) {
      const { otherAmount } = this.paymentData;
      this.amountForm.get('otherAmount').setValue(otherAmount);
    }

    if (!this.paymentData) {
      this.navigateBack();
    }

    this.isIos = this.platform.is('ios');
  }

  get otherAmount() {
    const { otherAmount } = this.amountForm.controls;
    return parseFloat(otherAmount && otherAmount.value ? otherAmount.value.replace(/,/, '') : 0);
  }

  async selectAmount() {
    this.paymentData.otherAmount = this.otherAmount;
    const isCustomAmount = this.paymentData.otherAmount !== 0;

    if (isCustomAmount && this.paymentData.otherAmount < this.paymentData.minimumAmount) {
      const alert = await this.alertCtrl.create({
        header: 'You are paying less than the minimum due.',
        message: 'Paying less than the minimum may result in policy cancelling.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.trackAmountSelectedEvent(false, false);
              alert.dismiss(false);
              return false;
            },
          },
          {
            text: 'Ok',
            handler: () => {
              this.trackAmountSelectedEvent(true, false);
              alert.dismiss(false);
              this.makePaymentService.setActivePayment(this.paymentData);
              this.navigateBack();
              return false;
            },
          },
        ],
      });
      alert.present();
    } else if (isCustomAmount && this.paymentData.otherAmount > this.paymentData.remainingPremium) {
      const alert = await this.alertCtrl.create({
        header: 'Payment error',
        message: 'You cannot pay more than the remaining premium.',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              alert.dismiss(false);
              return false;
            },
          },
        ],
      });
      alert.present();
    } else {
      this.makePaymentService.setActivePayment(this.paymentData);
      this.routerService.back();
    }
  }

  private trackAmountSelectedEvent(confirm: boolean, coversMinimumAmount: boolean) {
    const { payments, paymentData } = this;
    const eventProperties = {
      event_type: EventType.OPTION_SELECTED,
      selection: confirm ? 'Confirm' : 'Decline',
      min_amt_paid: coversMinimumAmount,
      policies: (paymentData.allPolicies
        ? payments
        : payments.filter((p) => p.policyNumber === paymentData.policyNumber)
      ).map((p) => ({
        policy_number: p.policyNumber,
        policy_type: PolicyType[p.policyType],
        policy_state: p.policyRiskState,
      })),
    };
    this.analyticsService.trackEvent(
      EventName.PAYMENT_AMOUNT_CONFIRMED,
      Category.payments,
      eventProperties
    );
  }

  selectAmountType(type) {
    this.paymentData.type = type;

    if (type !== 'other') {
      this.paymentData.otherAmount = 0;
      this.amountForm.controls.otherAmount.setValue('');
    }
  }

  cancel() {
    this.analyticsService.trackEvent(EventName.PAYMENT_AMOUNT_CANCELLED, Category.payments);
    this.navigateBack();
  }

  private navigateBack() {
    const { path, params } = this.makePaymentService.getReturnPathFromAmountMethodPages();
    this.routerService.navigateBack(path, params).then(noop);
  }
}
