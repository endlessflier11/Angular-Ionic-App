import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaPaymentSelectAmountRoutingModule } from './csaa-payment-select-amount-routing.module';
import { PaymentSelectAmountPage } from './payment-select-amount.page';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrMaskerModule } from 'br-mask';

@NgModule({
  declarations: [PaymentSelectAmountPage],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsaaPaymentSelectAmountRoutingModule,
    IonicModule,
    UiKitsModule,
    BrMaskerModule,
  ],
})
export class CsaaPaymentSelectAmountModule {}
