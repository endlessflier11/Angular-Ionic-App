import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CsaaPaperlessPage } from './csaa-paperless.page';

const routes: Routes = [
  {
    path: '',
    component: CsaaPaperlessPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaperlessPageRoutingModule {}
