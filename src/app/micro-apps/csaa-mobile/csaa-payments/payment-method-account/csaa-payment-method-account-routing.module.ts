import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { PaymentMethodAccountPage } from './payment-method-account.page';

const routes: AppRoutes = [
  {
    path: '',
    isGroupIndex: true,
    component: PaymentMethodAccountPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentMethodAccountRoutingModule {}
