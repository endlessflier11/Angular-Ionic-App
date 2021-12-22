import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaPaymentHistoryRoutingModule } from './csaa-payment-history-routing.module';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  imports: [
    CommonModule,
    CsaaPaymentHistoryRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaPaymentHistoryModule {}
