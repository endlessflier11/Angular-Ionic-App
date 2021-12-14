import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { PaymentIndexPage } from './payment-index.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: PaymentIndexPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentIndexRoutingModule {}
