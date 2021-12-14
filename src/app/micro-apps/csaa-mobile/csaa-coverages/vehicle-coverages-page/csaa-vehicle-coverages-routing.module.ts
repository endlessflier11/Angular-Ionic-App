import { NgModule } from '@angular/core';

import { CsaaVehicleCoveragesPage } from './vehicle-coverages.page';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../_core/interfaces';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: CsaaVehicleCoveragesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaVehicleCoveragesRoutingModule {}
