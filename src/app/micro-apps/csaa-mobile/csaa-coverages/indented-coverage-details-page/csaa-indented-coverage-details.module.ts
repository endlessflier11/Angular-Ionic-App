import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CsaaIndentedCoveragesDetailsPage } from './indented-coverage-details.page';
import { CsaaIndentedCoveragesDetailsRoutingModule } from './csaa-indented-coverage-details-routing.module';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaCoveragesUiKitsModule } from '../_shared/ui-kits/csaa-coverages-ui-kits.module';

@NgModule({
  declarations: [CsaaIndentedCoveragesDetailsPage],
  imports: [
    CommonModule,
    IonicModule,
    CsaaIndentedCoveragesDetailsRoutingModule,
    UiKitsModule,
    CsaaCoveragesUiKitsModule,
  ],
})
export class CsaaIndentedCoveragesDetailsModule {}
