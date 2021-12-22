import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CsaaAddPaymentMethodPageRoutingModule } from './add-payment-method-routing.module';

import { CsaaAddPaymentMethodPage } from './add-payment-method.page';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CsaaAddPaymentMethodPageRoutingModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
  ],
  declarations: [CsaaAddPaymentMethodPage],
})
export class CsaaAddPaymentMethodPageModule {}
