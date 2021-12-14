import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcaDevSettingsPage } from './aca-dev-settings.page';

const routes: Routes = [
  {
    path: '',
    component: AcaDevSettingsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcaDevSettingsPageRoutingModule {}
