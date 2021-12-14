import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutes } from '../_core/interfaces';
import { CsaaCoveragesIndexPage } from './coverages-index/coverages-index.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    pathMatch: 'full',
    component: CsaaCoveragesIndexPage,
  },
  {
    name: 'csaa.coverages.vehicle',
    path: 'vehicle/:vehicleId',
    loadChildren: () =>
      import('./vehicle-coverages-page/csaa-vehicle-coverages.module').then(
        (m) => m.CsaaVehicleCoveragesModule
      ),
  },
  {
    name: 'csaa.coverages.indented',
    path: 'details',
    loadChildren: () =>
      import('./indented-coverage-details-page/csaa-indented-coverage-details.module').then(
        (m) => m.CsaaIndentedCoveragesDetailsModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaCoveragesRoutingModule {}
