import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { CsaaPoiRoutingModule } from './csaa-poi-routing.module';
import { CsaaPoiIndexPage } from './poi-index/poi-index.page';
import { CsaaPaymentsUiKitsModule } from '../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { CsaaCoveragesUiKitsModule } from '../csaa-coverages/_shared/ui-kits/csaa-coverages-ui-kits.module';

@NgModule({
  declarations: [CsaaPoiIndexPage],
  exports: [CsaaPoiIndexPage],
  imports: [
    CommonModule,
    IonicModule,
    CsaaPoiRoutingModule,
    UiKitsModule,
    CsaaPoiRoutingModule,
    CsaaPaymentsUiKitsModule,
    CsaaCoveragesUiKitsModule,
  ],
})
export class CsaaPoiModule {}
