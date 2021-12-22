import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../../_shared/ui-kits/csaa-payments-ui-kits.module';
import { PaymentHistoryDetailPage } from './detail.page';
import { CsaaPaymentHistoryDetailRoutingModule } from './detail-routing.module';

@NgModule({
  declarations: [PaymentHistoryDetailPage],
  imports: [
    CommonModule,
    CsaaPaymentHistoryDetailRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaPaymentHistoryDetailModule {}
