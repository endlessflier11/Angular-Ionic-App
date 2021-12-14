import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaClaimsRoutingModule } from './csaa-claims-routing.module';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { CsaaClaimsUiKitsModule } from './_shared/ui-kits/csaa-claims-ui-kits.module';
import { ClaimsDetailPage } from './claims-detail/claims-detail.page';
import { ClaimsPreLossPage } from './claims-pre-loss/claims-pre-loss.page';
import { WhatToDoPage } from './what-to-do/what-to-do.page';

@NgModule({
  declarations: [ClaimsDetailPage, ClaimsPreLossPage, WhatToDoPage],
  imports: [
    CommonModule,
    CsaaClaimsRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaClaimsUiKitsModule,
  ],
})
export class CsaaClaimsModule {}
