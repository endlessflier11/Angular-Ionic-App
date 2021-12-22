import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    loadChildren: () => import('./list/list.module').then((m) => m.CsaaPaymentHistoryListModule),
  },
  {
    name: 'csaa.payment.history.policy',
    path: ':policyNumber',
    loadChildren: () =>
      import('./detail/detail.module').then((m) => m.CsaaPaymentHistoryDetailModule),
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentHistoryRoutingModule {}
