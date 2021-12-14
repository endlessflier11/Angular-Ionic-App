import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcaDevSettingsPageRoutingModule } from './aca-dev-settings-routing.module';

import { AcaDevSettingsPage } from './aca-dev-settings.page';
import { ComponentsModule } from '../../_core/components/components.module';
import { UiKitsModule } from '../../micro-apps/csaa-mobile/_core/ui-kits/ui-kits.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    AcaDevSettingsPageRoutingModule,
    UiKitsModule,
  ],
  declarations: [AcaDevSettingsPage],
})
export class AcaDevSettingsPageModule {}
