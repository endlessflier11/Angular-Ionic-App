import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CsaaPaymentHistoryCardComponent } from './csaa-payment-history-card/csaa-payment-history-card.component';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentHistorySelectCardComponent } from './csaa-payment-history-select-card/csaa-payment-history-select-card.component';
import { CsaaPaymentSucceededCardComponent } from './csaa-payment-succeeded-card/csaa-payment-succeeded-card.component';
import { CsaaMakePaymentCardComponent } from './csaa-make-payment-card/csaa-make-payment-card.component';
import { CsaaPayAllPoliciesCardComponent } from './csaa-pay-all-policies-card/csaa-pay-all-policies-card.component';
import { PaymentTermsConditionsComponent } from './payment-terms-conditions/payment-terms-conditions.component';
import { AutopayTermsConditionsComponent } from './autopay-terms-conditions/autopay-terms-conditions.component';
import { CsaaBillsCardComponent } from './csaa-bills-card/csaa-bills-card.component';
import { AutopayDiscountCardComponent } from './autopay-discount-card/autopay-discount-card.component';

const SHARED_COMPONENTS = [
  CsaaPaymentHistoryCardComponent,
  CsaaPaymentHistorySelectCardComponent,
  CsaaMakePaymentCardComponent,
  CsaaPaymentSucceededCardComponent,
  CsaaPayAllPoliciesCardComponent,
  PaymentTermsConditionsComponent,
  AutopayTermsConditionsComponent,
  CsaaBillsCardComponent,
  AutopayDiscountCardComponent,
];

@NgModule({
  declarations: [...SHARED_COMPONENTS],
  imports: [CommonModule, IonicModule, UiKitsModule, IonicModule],
  exports: [...SHARED_COMPONENTS],
})
export class CsaaPaymentsUiKitsModule {}
