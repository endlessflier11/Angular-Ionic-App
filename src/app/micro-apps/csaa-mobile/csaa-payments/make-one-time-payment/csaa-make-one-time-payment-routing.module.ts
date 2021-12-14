import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { MakeOneTimePaymentPage } from './make-one-time-payment.page';

const routes: AppRoutes = [
  {
    path: '',
    isGroupIndex: true,
    component: MakeOneTimePaymentPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaMakeOneTimePaymentRoutingModule {}
