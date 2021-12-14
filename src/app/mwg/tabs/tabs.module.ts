import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabsRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [TabsPage],
  imports: [CommonModule, TabsRoutingModule, IonicModule],
})
export class TabsModule {}
