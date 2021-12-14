import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CsaaVehicleCoveragesPage } from './vehicle-coverages.page';
import { CsaaVehicleCoveragesRoutingModule } from './csaa-vehicle-coverages-routing.module';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaCoveragesUiKitsModule } from '../_shared/ui-kits/csaa-coverages-ui-kits.module';

@NgModule({
  declarations: [CsaaVehicleCoveragesPage],
  imports: [
    CommonModule,
    IonicModule,
    CsaaVehicleCoveragesRoutingModule,
    UiKitsModule,
    CsaaCoveragesUiKitsModule,
  ],
})
export class CsaaVehicleCoveragesModule {}
