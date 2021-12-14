import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { CsaaCoveragesRoutingModule } from './csaa-coverages-routing.module';
import { CsaaCoveragesUiKitsModule } from './_shared/ui-kits/csaa-coverages-ui-kits.module';
import { CsaaCoveragesIndexPage } from './coverages-index/coverages-index.page';

@NgModule({
  declarations: [CsaaCoveragesIndexPage],
  exports: [CsaaCoveragesIndexPage],
  imports: [
    CommonModule,
    IonicModule,
    CsaaCoveragesRoutingModule,
    UiKitsModule,
    CsaaCoveragesUiKitsModule,
  ],
})
export class CsaaCoveragesModule {}
