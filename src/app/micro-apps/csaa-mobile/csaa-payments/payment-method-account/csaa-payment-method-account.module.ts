import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaPaymentMethodAccountRoutingModule } from './csaa-payment-method-account-routing.module';
import { PaymentMethodAccountPage } from './payment-method-account.page';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CsaaPaymentDirectivesModule } from '../_shared/directives/csaa-payment-directives.module';

@NgModule({
  declarations: [PaymentMethodAccountPage],
  imports: [
    CommonModule,
    CsaaPaymentMethodAccountRoutingModule,
    IonicModule,
    UiKitsModule,
    ReactiveFormsModule,
    CsaaPaymentDirectivesModule,
  ],
})
export class CsaaPaymentMethodAccountModule {}
