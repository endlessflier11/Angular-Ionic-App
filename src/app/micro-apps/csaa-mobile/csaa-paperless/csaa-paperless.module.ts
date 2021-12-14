import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CsaaPaperlessPageRoutingModule } from './csaa-paperless-routing.module';

import { CsaaPaperlessPage } from './csaa-paperless.page';
import {
  CsaaPolicyPaperlessPreferenceCardComponent
} from './components/policy-paperless-preference-card/csaa-policy-paperless-preference-card.component';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { AccordionModule } from '../_core/ui-kits/accordion/accordion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CsaaPaperlessPageRoutingModule,
    UiKitsModule,
    AccordionModule,
  ],
  declarations: [CsaaPaperlessPage, CsaaPolicyPaperlessPreferenceCardComponent],
})
export class CsaaPaperlessPageModule {}
