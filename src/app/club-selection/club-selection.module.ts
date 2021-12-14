import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClubSelectionPageRoutingModule } from './club-selection-routing.module';

import { ClubSelectionPage } from './club-selection.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ClubSelectionPageRoutingModule],
  declarations: [ClubSelectionPage],
})
export class ClubSelectionPageModule {}
