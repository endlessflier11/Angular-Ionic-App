import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CsaaHomePage } from './csaa-home.page';

const routes: Routes = [
  {
    path: '',
    component: CsaaHomePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaHomePageRoutingModule {}
