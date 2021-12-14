import { NgModule } from '@angular/core';
import { AuthLandingPage } from './auth-landing-page.component';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '@csaadigital/mobile-mypolicy';

const routes: AppRoutes = [
  {
    path: '',
    component: AuthLandingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthLandingRoutingModule {}
