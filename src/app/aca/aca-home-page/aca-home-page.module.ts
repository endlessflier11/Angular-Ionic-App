import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcaHomePagePageRoutingModule } from './aca-home-page-routing.module';

import { AcaHomePagePage } from './aca-home-page.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AcaHomePagePageRoutingModule],
  declarations: [AcaHomePagePage],
})
export class AcaHomePagePageModule {}
