import { NgModule } from '@angular/core';
import { SsoLoginPage } from './sso-login.page';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '@csaadigital/mobile-mypolicy';
// This is here because the main app depends on micro-app's HttpService which requires that AppEndpoints are loaded.
// Without it, we'd have to manually fetch service locator data.
// In production, parent app does not need micro-app's HttpService.
import { BootstrapGuard } from '../../micro-apps/csaa-mobile/_core/guards/bootstrap/bootstrap.guard';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    component: SsoLoginPage,
    canActivate: [BootstrapGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaSsoLoginRoutingModule {}
