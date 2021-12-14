import { NgModule } from '@angular/core';
import { ClaimsPreLossPage } from './claims-pre-loss/claims-pre-loss.page';
import { WhatToDoPage } from './what-to-do/what-to-do.page';
import { ClaimsDetailPage } from './claims-detail/claims-detail.page';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../_core/interfaces';
const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    pathMatch: 'full',
    redirectTo: 'pre-loss',
  },
  {
    name: 'csaa.claims.detail',
    path: 'detail/:claimNumber',
    component: ClaimsDetailPage,
  },
  {
    name: 'csaa.claims.pre-loss',
    path: 'pre-loss',
    component: ClaimsPreLossPage,
  },
  {
    name: 'csaa.claims.what-do-do',
    path: 'what-to-do/:policyType',
    component: WhatToDoPage,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaClaimsRoutingModule {}
