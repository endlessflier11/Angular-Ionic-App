import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { AppRoutes } from '@csaadigital/mobile-mypolicy';

const routes: AppRoutes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'club-selection',
  },
  {
    name: 'csaa.parent.app',
    path: 'mobile/mwg',
    loadChildren: () => import('./mwg/tabs/tabs.module').then((m) => m.TabsModule),
  },
  {
    name: 'csaa.parent.app.aca',
    path: 'mobile/aca',
    loadChildren: () =>
      import('./aca/aca-home-page/aca-home-page.module').then((m) => m.AcaHomePagePageModule),
  },
  {
    name: 'csaa.parent.auth',
    path: 'auth',
    loadChildren: () => import('./auth/main-auth.module').then((m) => m.MainAuthModule),
  },
  {
    path: 'club-selection',
    loadChildren: () =>
      import('./club-selection/club-selection.module').then((m) => m.ClubSelectionPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
