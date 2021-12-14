import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabPlaceholderPage } from './tab-placeholder.page';

const routes: Routes = [{ path: '', component: TabPlaceholderPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabPlaceholderRoutingModule {}
