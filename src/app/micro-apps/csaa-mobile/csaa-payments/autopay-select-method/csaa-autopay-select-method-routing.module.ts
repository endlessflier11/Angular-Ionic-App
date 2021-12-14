import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';
import { AutopaySelectMethodPage } from './autopay-select-method.page';

const routes: AppRoutes = [
  {
    path: '',
    isGroupIndex: true,
    component: AutopaySelectMethodPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaAutopaySelectMethodRoutingModule {}
