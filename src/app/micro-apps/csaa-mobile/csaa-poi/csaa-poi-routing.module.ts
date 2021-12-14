import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutes } from '../_core/interfaces';
import { CsaaPoiIndexPage } from './poi-index/poi-index.page';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    pathMatch: 'full',
    component: CsaaPoiIndexPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPoiRoutingModule {}
