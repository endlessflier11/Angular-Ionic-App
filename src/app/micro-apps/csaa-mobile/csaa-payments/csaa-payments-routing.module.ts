import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../_core/interfaces';

const routes: AppRoutes = [
  {
    isGroupIndex: true,
    path: '',
    loadChildren: () =>
      import('./payment-index/csaa-payment-index.module').then((m) => m.CsaaPaymentIndexModule),
  },
  {
    name: 'csaa.payment.amount',
    path: 'amount',
    loadChildren: () =>
      import('./payment-select-amount/csaa-payment-select-amount.module').then(
        (m) => m.CsaaPaymentSelectAmountModule
      ),
  },
  {
    name: 'csaa.payment.method',
    path: 'method',
    loadChildren: () =>
      import('./payment-select-method/csaa-payment-select-method.module').then(
        (m) => m.CsaaPaymentSelectMethodModule
      ),
  },
  {
    name: 'csaa.payment.method.card',
    path: 'method/card',
    loadChildren: () =>
      import('./payment-method-card/csaa-payment-method-card.module').then(
        (m) => m.CsaaPaymentMethodCardModule
      ),
  },
  {
    name: 'csaa.payment.method.card.edit',
    path: 'method/card/:account',
    loadChildren: () =>
      import('./payment-method-card/csaa-payment-method-card.module').then(
        (m) => m.CsaaPaymentMethodCardModule
      ),
  },
  {
    name: 'csaa.payment.method.checking-account',
    path: 'method/checking-account',
    loadChildren: () =>
      import('./payment-method-account/csaa-payment-method-account.module').then(
        (m) => m.CsaaPaymentMethodAccountModule
      ),
  },
  {
    name: 'csaa.payment.method.checking-account.edit',
    path: 'method/checking-account/:account',
    loadChildren: () =>
      import('./payment-method-account/csaa-payment-method-account.module').then(
        (m) => m.CsaaPaymentMethodAccountModule
      ),
  },
  {
    name: 'csaa.payment.method.savings-account',
    path: 'method/savings-account',
    loadChildren: () =>
      import('./payment-method-account/csaa-payment-method-account.module').then(
        (m) => m.CsaaPaymentMethodAccountModule
      ),
  },
  {
    name: 'csaa.payment.method.savings-account.edit',
    path: 'method/savings-account/:account',
    loadChildren: () =>
      import('./payment-method-account/csaa-payment-method-account.module').then(
        (m) => m.CsaaPaymentMethodAccountModule
      ),
  },
  {
    name: 'csaa.payment.history',
    path: 'history',
    loadChildren: () =>
      import('./payment-history/csaa-payment-history.module').then(
        (m) => m.CsaaPaymentHistoryModule
      ),
  },
  {
    name: 'csaa.payment.autopay.settings',
    path: ':policyNumber/autopay/settings',
    loadChildren: () =>
      import('./autopay-settings/csaa-autopay-settings.module').then(
        (m) => m.CsaaAutopaySettingsModule
      ),
  },
  {
    name: 'csaa.payment.autopay.method',
    path: ':policyNumber/autopay/method',
    loadChildren: () =>
      import('./autopay-select-method/csaa-autopay-select-method.module').then(
        (m) => m.CsaaAutopaySelectMethodModule
      ),
  },
  {
    name: 'csaa.payment.payall',
    path: 'payall',
    loadChildren: () => import('./payall/payall.module').then((m) => m.PayallPageModule),
  },
  {
    name: 'csaa.payment.add-payment-method',
    path: 'add-payment-method',
    loadChildren: () =>
      import('./add-payment-method/add-payment-method.module').then(
        (m) => m.CsaaAddPaymentMethodPageModule
      ),
  },

  {
    name: 'csaa.payment.make.payment',
    path: ':policyNumber/make-payment',
    loadChildren: () =>
      import('./make-one-time-payment/csaa-make-one-time-payment.module').then(
        (m) => m.CsaaMakeOneTimePaymentModule
      ),
  },
  {
    name: 'csaa.payment.make.payment.method',
    path: ':policyNumber/make-payment/method',
    loadChildren: () =>
      import('./payment-select-method/csaa-payment-select-method.module').then(
        (m) => m.CsaaPaymentSelectMethodModule
      ),
  },
  {
    name: 'csaa.payment.make.payment.amount',
    path: ':policyNumber/make-payment/amount',
    loadChildren: () =>
      import('./payment-select-amount/csaa-payment-select-amount.module').then(
        (m) => m.CsaaPaymentSelectAmountModule
      ),
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CsaaPaymentsRoutingModule {}
