import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CsaaAddPaymentMethodPage } from './add-payment-method.page';

const routes: Routes = [
  {
    path: '',
    component: CsaaAddPaymentMethodPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaAddPaymentMethodPageRoutingModule {}
