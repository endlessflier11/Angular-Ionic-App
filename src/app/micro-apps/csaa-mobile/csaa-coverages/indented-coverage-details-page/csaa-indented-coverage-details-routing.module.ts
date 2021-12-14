import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutes } from '../../_core/interfaces';
import { CsaaIndentedCoveragesDetailsPage } from './indented-coverage-details.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: CsaaIndentedCoveragesDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaIndentedCoveragesDetailsRoutingModule {}
