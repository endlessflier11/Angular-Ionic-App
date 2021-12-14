import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaPaymentSelectMethodRoutingModule } from './csaa-payment-select-method-routing.module';
import { PaymentSelectMethodPage } from './payment-select-method.page';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  declarations: [PaymentSelectMethodPage],
  imports: [
    CommonModule,
    CsaaPaymentSelectMethodRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaPaymentSelectMethodModule {}
