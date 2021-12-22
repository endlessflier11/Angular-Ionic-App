import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PaymentHistoryListPage } from './list.page';
import { AppRoutes } from '../../../_core/interfaces';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: PaymentHistoryListPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentHistoryListRoutingModule {}
