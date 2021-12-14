import { NgModule } from '@angular/core';
import { PaymentSelectAmountPage } from './payment-select-amount.page';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutes } from '../../_core/interfaces';

const routes: AppRoutes = [
  {
    path: '',
    isGroupIndex: true,
    component: PaymentSelectAmountPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule],
})
export class CsaaPaymentSelectAmountRoutingModule {}
