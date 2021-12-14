import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '@csaadigital/mobile-mypolicy';
import { TabsPage } from './tabs.page';

const children: AppRoutes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tab1',
  },
  {
    path: 'tab1',
    loadChildren: () =>
      import('../tab-placeholder/tab-placeholder.module').then((m) => m.TabPlaceholderModule),
  },
  {
    path: 'csaa',
    loadChildren: () =>
      import('../../micro-apps/csaa-mobile/csaa-app.module').then((m) => m.CsaaAppModule),
  },
  {
    path: 'tab3',
    loadChildren: () =>
      import('../tab-placeholder/tab-placeholder.module').then((m) => m.TabPlaceholderModule),
  },
];

const routes: AppRoutes = [
  {
    path: '',
    component: TabsPage,
    children,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsRoutingModule {}
