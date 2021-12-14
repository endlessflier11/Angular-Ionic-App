import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabPlaceholderRoutingModule } from './tab-placeholder-routing.module';
import { TabPlaceholderPage } from './tab-placeholder.page';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../_core/components/components.module';
import { UiKitsModule } from '../../micro-apps/csaa-mobile/_core/ui-kits/ui-kits.module';

@NgModule({
  declarations: [TabPlaceholderPage],
  imports: [CommonModule, ComponentsModule, TabPlaceholderRoutingModule, IonicModule, UiKitsModule],
})
export class TabPlaceholderModule {}
