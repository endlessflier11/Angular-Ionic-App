import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaPaymentMethodCardRoutingModule } from './csaa-payment-method-card-routing.module';
import { PaymentMethodCardPage } from './payment-method-card.page';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrMaskerModule } from 'br-mask';
import { CsaaPaymentDirectivesModule } from '../_shared/directives/csaa-payment-directives.module';

@NgModule({
  declarations: [PaymentMethodCardPage],
  imports: [
    CommonModule,
    CsaaPaymentMethodCardRoutingModule,
    ReactiveFormsModule,
    IonicModule,
    UiKitsModule,
    BrMaskerModule,
    CsaaPaymentDirectivesModule,
  ],
})
export class CsaaPaymentMethodCardModule {}
