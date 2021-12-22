import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PaymentHistoryListPage } from './list.page';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../../_shared/ui-kits/csaa-payments-ui-kits.module';
import { CsaaPaymentHistoryListRoutingModule } from './list-routing.module';

@NgModule({
  declarations: [PaymentHistoryListPage],
  imports: [
    CommonModule,
    CsaaPaymentHistoryListRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaPaymentHistoryListModule {}
