import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayallPageRoutingModule } from './payall-routing.module';

import { PayallPage } from './payall.page';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UiKitsModule,
    CsaaPaymentsUiKitsModule,
    PayallPageRoutingModule,
  ],
  declarations: [PayallPage],
})
export class PayallPageModule {}
