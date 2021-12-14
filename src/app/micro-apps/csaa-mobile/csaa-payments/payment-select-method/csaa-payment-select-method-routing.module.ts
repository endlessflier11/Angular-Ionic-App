import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { PaymentSelectMethodPage } from './payment-select-method.page';

const routes: AppRoutes = [
  {
    path: '',
    isGroupIndex: true,
    component: PaymentSelectMethodPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentSelectMethodRoutingModule {}
