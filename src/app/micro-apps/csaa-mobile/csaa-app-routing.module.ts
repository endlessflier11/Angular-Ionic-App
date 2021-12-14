import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './_core/interfaces';
import { CsaaAuthGuard } from './_core/guards/csaa-auth.guard';
import { BootstrapGuard } from './_core/guards/bootstrap/bootstrap.guard';

const BEFORE_ROUTE_ENTER = [BootstrapGuard, CsaaAuthGuard];

const routes: AppRoutes = [
  {
    path: '',
    pathMatch: 'full',
    isGroupIndex: true,
    canActivate: [BootstrapGuard, CsaaAuthGuard],
    loadChildren: () => import('./csaa-home/csaa-home.module').then((m) => m.CsaaHomePageModule),
  },
  {
    path: 'coverages/:policyNumber',
    name: 'csaa.coverages.index',
    canActivate: [...BEFORE_ROUTE_ENTER],
    loadChildren: () =>
      import('./csaa-coverages/coverages.module').then((m) => m.CsaaCoveragesModule),
  },
  {
    path: 'payment',
    name: 'csaa.payment.index',
    canActivate: [...BEFORE_ROUTE_ENTER],
    loadChildren: () =>
      import('./csaa-payments/csaa-payments.module').then((m) => m.CsaaPaymentsModule),
  },
  {
    path: 'claims',
    name: 'csaa.claims.index',
    canActivate: [...BEFORE_ROUTE_ENTER],
    loadChildren: () => import('./csaa-claims/csaa-claims.module').then((m) => m.CsaaClaimsModule),
  },
  {
    path: 'poi/:policyNumber',
    name: 'csaa.poi.index',
    canActivate: [...BEFORE_ROUTE_ENTER],
    loadChildren: () => import('./csaa-poi/poi.module').then((m) => m.CsaaPoiModule),
  },
  {
    path: 'documents/:policyNumber',
    name: 'csaa.documents.index',
    canActivate: [BootstrapGuard, CsaaAuthGuard],
    loadChildren: () =>
      import('./csaa-documents/csaa-documents-page/csaa-documents-page.module').then(
        (m) => m.CsaaDocumentsPageModule
      ),
  },
  {
    path: 'paperless',
    name: 'csaa.paperless.index',
    canActivate: [...BEFORE_ROUTE_ENTER],
    loadChildren: () =>
      import('./csaa-paperless/csaa-paperless.module').then((m) => m.CsaaPaperlessPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaAppRoutingModule {}
