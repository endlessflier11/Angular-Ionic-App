import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CsaaCanDeactivateGuard } from '../../_core/guards/can-deactivate.guard';
import { AppRoutes } from '../../_core/interfaces';
import { AutopaySettingsPage } from './autopay-settings.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: AutopaySettingsPage,
    canDeactivate: [CsaaCanDeactivateGuard],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaAutopaySettingsRoutingModule {}
