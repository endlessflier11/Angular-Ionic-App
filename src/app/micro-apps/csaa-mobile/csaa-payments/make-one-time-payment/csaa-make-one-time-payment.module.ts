import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaMakeOneTimePaymentRoutingModule } from './csaa-make-one-time-payment-routing.module';
import { MakeOneTimePaymentPage } from './make-one-time-payment.page';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  declarations: [MakeOneTimePaymentPage],
  imports: [
    CommonModule,
    CsaaMakeOneTimePaymentRoutingModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
})
export class CsaaMakeOneTimePaymentModule {}
