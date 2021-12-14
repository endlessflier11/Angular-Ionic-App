import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaAutopaySelectMethodRoutingModule } from './csaa-autopay-select-method-routing.module';
import { AutopaySelectMethodPage } from './autopay-select-method.page';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  declarations: [AutopaySelectMethodPage],
  imports: [
    CommonModule,
    CsaaAutopaySelectMethodRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaAutopaySelectMethodModule {}
