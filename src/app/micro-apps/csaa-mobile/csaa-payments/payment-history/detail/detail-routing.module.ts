import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../../_core/interfaces';
import { PaymentHistoryDetailPage } from './detail.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: PaymentHistoryDetailPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentHistoryDetailRoutingModule {}
