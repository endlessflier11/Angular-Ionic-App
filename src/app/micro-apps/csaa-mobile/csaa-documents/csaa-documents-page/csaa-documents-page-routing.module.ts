import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CsaaDocumentsPageComponent } from './csaa-documents-page.component';

const routes: Routes = [
  {
    path: '',
    component: CsaaDocumentsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaDocumentsPageRoutingModule {}
