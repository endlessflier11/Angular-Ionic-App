import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcaHomePagePage } from './aca-home-page.page';

const routes: Routes = [
  {
    path: '',
    component: AcaHomePagePage,
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('../aca-dev-settings/aca-dev-settings.module').then((m) => m.AcaDevSettingsPageModule),
  },
  {
    path: 'csaa',
    loadChildren: () =>
      import('../../micro-apps/csaa-mobile/csaa-app.module').then((m) => m.CsaaAppModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('../../auth/main-auth.module').then((m) => m.MainAuthModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcaHomePagePageRoutingModule {}
