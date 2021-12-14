import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CsaaDocumentsPageComponent } from './csaa-documents-page.component';
import { CsaaDocumentsPageRoutingModule } from './csaa-documents-page-routing.module';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { DocumentModalComponent } from '../document-modal/document-modal.component';

@NgModule({
  declarations: [CsaaDocumentsPageComponent, DocumentModalComponent],
  imports: [
    CommonModule,
    CsaaDocumentsPageRoutingModule,
    FormsModule,
    IonicModule,
    UiKitsModule,
    // CollapsedCardModule,
    // CardListModule,
    // SpinnerModule,
    // PolicyStatusCardModule,
  ],
})
export class CsaaDocumentsPageModule {}
