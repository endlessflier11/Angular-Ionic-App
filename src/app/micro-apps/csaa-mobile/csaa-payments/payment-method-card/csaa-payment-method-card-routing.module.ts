import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { PaymentMethodCardPage } from './payment-method-card.page';

const routes: AppRoutes = [
  {
    path: '',
    isGroupIndex: true,
    component: PaymentMethodCardPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentMethodCardRoutingModule {}
