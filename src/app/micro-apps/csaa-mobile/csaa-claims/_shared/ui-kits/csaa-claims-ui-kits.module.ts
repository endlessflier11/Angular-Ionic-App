import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { AgentCardComponent } from './agent-card/agent-card.component';
import { ClaimsHistoryCardComponent } from './claims-history-card/claims-history-card.component';
import { ClaimsInfoCardComponent } from './claims-info-card/claims-info-card.component';
import { WhatToDoCardComponent } from './what-to-do-card/what-to-do-card.component';

const SHARED_COMPONENTS = [
  AgentCardComponent,
  ClaimsHistoryCardComponent,
  ClaimsInfoCardComponent,
  WhatToDoCardComponent,
];

@NgModule({
  declarations: [...SHARED_COMPONENTS],
  imports: [CommonModule, IonicModule, UiKitsModule],
  exports: [...SHARED_COMPONENTS],
})
export class CsaaClaimsUiKitsModule {}
