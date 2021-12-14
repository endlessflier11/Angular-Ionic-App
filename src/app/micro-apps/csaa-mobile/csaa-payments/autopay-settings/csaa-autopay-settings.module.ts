import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutopaySettingsPage } from './autopay-settings.page';
import { CsaaAutopaySettingsRoutingModule } from './csaa-autopay-settings-routing.module';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AutopaySettingsPage],
  imports: [
    CommonModule,
    CsaaAutopaySettingsRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
    FormsModule,
  ],
})
export class CsaaAutopaySettingsModule {}
