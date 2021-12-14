import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClubSelectionPage } from './club-selection.page';

const routes: Routes = [
  {
    path: '',
    component: ClubSelectionPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClubSelectionPageRoutingModule {}
