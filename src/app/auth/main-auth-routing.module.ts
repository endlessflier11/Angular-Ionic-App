import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '@csaadigital/mobile-mypolicy';
import { GuestGuard } from '../_core/guards/guest.guard';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    pathMatch: 'full',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./auth-landing/auth-landing.module').then((m) => m.AuthLandingModule),
  },
  {
    name: 'csaa.parent.auth.sso',
    path: 'sso',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./sso-login/csaa-sso-login.module').then((m) => m.CsaaSsoLoginModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainAuthRoutingModule {}
