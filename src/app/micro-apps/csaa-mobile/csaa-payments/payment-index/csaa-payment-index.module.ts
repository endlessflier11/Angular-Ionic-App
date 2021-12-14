import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentIndexPage } from './payment-index.page';
import { CsaaPaymentIndexRoutingModule } from './csaa-payment-index-routing.module';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  declarations: [PaymentIndexPage],
  imports: [
    CommonModule,
    CsaaPaymentIndexRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaPaymentIndexModule {}
