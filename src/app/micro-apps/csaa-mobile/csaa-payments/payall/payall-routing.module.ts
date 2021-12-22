import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayallPage } from './payall.page';

const routes: Routes = [
  {
    path: '',
    component: PayallPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayallPageRoutingModule {}
