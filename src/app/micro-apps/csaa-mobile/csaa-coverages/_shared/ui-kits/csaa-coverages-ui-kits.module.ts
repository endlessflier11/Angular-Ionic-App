import { NgModule } from '@angular/core';
import { CsaaPupCoveragesCardComponent } from './csaa-pup-coverages-card/csaa-pup-coverages-card.component';
import { CsaaGeneralCoveragesCardComponent } from './csaa-general-coverages-card/csaa-general-coverages-card.component';
import { CsaaDriversCoveragesCardComponent } from './csaa-drivers-coverages-card/csaa-drivers-coverages-card.component';
import { CsaaHomeCoveragesCardComponent } from './csaa-home-coverages-card/csaa-home-coverages-card.component';
import { CsaaVehiclesCoveragesCardComponent } from './csaa-vehicles-coverages-card/csaa-vehicles-coverages-card.component';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CsaaCoverageCardItemComponent } from './csaa-coverage-card-item/csaa-coverage-card-item.component';
import {
  CsaaCoveragesVehicleCoveredCardComponent
} from './csaa-vehicle-coverages-covered-card/csaa-coverages-vehicle-covered-card.component';
import {
  CsaaCoveragesVehicleNotCoveredCardComponent
} from './csaa-vehicle-coverages-not-covered-card/csaa-coverages-vehicle-not-covered-card.component';
import { CsaaDriversCoveragesContentV1Component } from './csaa-drivers-coverages-content-v1/csaa-drivers-coverages-content-v1.component';
import { CsaaDriversCoveragesContentV2Component } from './csaa-drivers-coverages-content-v2/csaa-drivers-coverages-content-v2.component';

const SHARED_COMPONENTS = [
  CsaaCoverageCardItemComponent,
  CsaaPupCoveragesCardComponent,
  CsaaGeneralCoveragesCardComponent,
  CsaaDriversCoveragesCardComponent,
  CsaaDriversCoveragesContentV1Component,
  CsaaHomeCoveragesCardComponent,
  CsaaVehiclesCoveragesCardComponent,
  CsaaCoveragesVehicleCoveredCardComponent,
  CsaaCoveragesVehicleNotCoveredCardComponent,
  CsaaDriversCoveragesContentV2Component,
];

@NgModule({
  declarations: [...SHARED_COMPONENTS],
  imports: [CommonModule, IonicModule, UiKitsModule],
  exports: [...SHARED_COMPONENTS],
})
export class CsaaCoveragesUiKitsModule {}
