import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CsaaHomePageRoutingModule } from './csaa-home-routing.module';
import { CsaaHomePage } from './csaa-home.page';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { InsuranceCardComponent } from './insurance-card/insurance-card.component';
import { PaymentsCardComponent } from './payments-card/payments-card.component';
import { PolicyCancelledCardComponent } from './policy-cancelled-card/policy-cancelled-card.component';
import { ErrorCardComponent } from './error-card/error-card.component';
import { CoveragesCardComponent } from './coverages-card/coverages-card.component';
import { ClaimsCardComponent } from './claims-card/claims-card.component';
import { NoActivePoliciesCardComponent } from './no-active-policies-card/no-active-policies-card.component';
import { GetAQuoteCardComponent } from './get-a-quote-card/get-a-quote-card.component';
import { FileAClaimCardComponent } from './file-a-claim-card/file-a-claim-card.component';
import { CsaaPaymentsUiKitsModule } from '../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { DocumentsCardComponent } from './documents-card/documents-card.component';
import { PaperlessPreferenceCardComponent } from './paperless-preference-card/paperless-preference-card.component';

@NgModule({
  declarations: [
    CsaaHomePage,
    InsuranceCardComponent,
    PaymentsCardComponent,
    PolicyCancelledCardComponent,
    ErrorCardComponent,
    CoveragesCardComponent,
    ClaimsCardComponent,
    NoActivePoliciesCardComponent,
    GetAQuoteCardComponent,
    FileAClaimCardComponent,
    DocumentsCardComponent,
    PaperlessPreferenceCardComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    CsaaHomePageRoutingModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaHomePageModule {}
