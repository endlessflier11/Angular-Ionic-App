import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { PaymentHistoryPage } from './payment-history.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: PaymentHistoryPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentHistoryRoutingModule {}
