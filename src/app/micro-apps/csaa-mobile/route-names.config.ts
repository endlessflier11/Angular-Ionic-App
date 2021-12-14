// Unlike some other frameworks, angular's routing system by default is modular.
// This means routes are registered at the point when a module is loaded.
// As a direct consequence, we don't know the route's path beforehand.
// So we need to define all our route config here and import this config into our individual modules.
// That way, things remain modular.

import { NamedRouteConfig } from './_core/interfaces';

// TODO: we should get rid of this, cause the parent app doesn't need to use named routes
const PARENT_APP_ROUTES: NamedRouteConfig[] = [
  {
    name: 'csaa.parent.home',
    path: '',
  },
  {
    name: 'csaa.parent.app',
    path: 'mobile/mwg',
    children: [
      {
        name: 'csaa.parent.tab1',
        path: 'tab1',
      },
      {
        name: 'csaa.parent.tab2',
        path: 'csaa',
      },
      {
        name: 'csaa.parent.tab3',
        path: 'tab3',
      },
    ],
  },
  {
    name: 'csaa.parent.app.aca',
    path: 'mobile/aca',
  },
  {
    name: 'csaa.parent.auth',
    path: 'auth',
    children: [
      {
        name: 'csaa.parent.auth.sso',
        path: 'sso',
      },
      {
        name: 'csaa.parent.non-insured',
        path: 'non-insured',
      },
    ],
  },
];

const CSAA_COVERAGE_ROUTES: NamedRouteConfig[] = [
  {
    name: 'csaa.coverages.index',
    path: 'coverages/:policyNumber',
    children: [
      {
        name: 'csaa.coverages.vehicle',
        path: 'vehicle/:vehicleId',
      },
      {
        name: 'csaa.coverages.indented',
        path: 'details',
      },
    ],
  },
];
const CSAA_PAYMENT_ROUTES: NamedRouteConfig[] = [
  {
    name: 'csaa.payment.index',
    path: 'payment',
    children: [
      { name: 'csaa.payment.amount', path: 'amount' },
      { name: 'csaa.payment.method', path: 'method' },
      { name: 'csaa.payment.method.card', path: 'method/card' },
      { name: 'csaa.payment.method.card.edit', path: 'method/card/:account' },
      { name: 'csaa.payment.method.savings-account', path: 'method/savings-account' },
      { name: 'csaa.payment.method.savings-account.edit', path: 'method/savings-account/:account' },
      { name: 'csaa.payment.method.checking-account', path: 'method/checking-account' },
      {
        name: 'csaa.payment.method.checking-account.edit',
        path: 'method/checking-account/:account',
      },
      { name: 'csaa.payment.history', path: ':policyNumber/history' },
      { name: 'csaa.payment.autopay.settings', path: ':policyNumber/autopay/settings' },
      { name: 'csaa.payment.autopay.method', path: ':policyNumber/autopay/method' },
      { name: 'csaa.payment.make.payment', path: ':policyNumber/make-payment' },
      { name: 'csaa.payment.make.payment.method', path: ':policyNumber/make-payment/method' },
      { name: 'csaa.payment.make.payment.amount', path: ':policyNumber/make-payment/amount' },
    ],
  },
];

const CSAA_CLAIM_ROUTES: NamedRouteConfig[] = [
  {
    name: 'csaa.claims.index',
    path: 'claims',
    children: [
      { name: 'csaa.claims.detail', path: 'detail/:claimNumber' },
      { name: 'csaa.claims.pre-loss', path: 'pre-loss' },
      { name: 'csaa.claims.what-do-do', path: 'what-to-do/:policyType' },
    ],
  },
];

const CSAA_POI_ROUTES: NamedRouteConfig[] = [
  // proof of insurance
  {
    name: 'csaa.poi.index',
    path: 'poi/:policyNumber',
  },
];

const CSAA_DOCUMENT_ROUTES: NamedRouteConfig[] = [
  // documents
  {
    name: 'csaa.documents.index',
    path: 'documents/:policyNumber',
  },
];

const CSAA_PAPERLESS_ROUTES: NamedRouteConfig[] = [
  {
    name: 'csaa.paperless.index',
    path: 'paperless',
  },
];

const CSAA_APP_ROUTES: NamedRouteConfig[] = [
  {
    name: 'csaa.home',
    path: '', // we will receive our module root path on config.setup()
    children: [
      ...CSAA_COVERAGE_ROUTES,
      ...CSAA_PAYMENT_ROUTES,
      ...CSAA_CLAIM_ROUTES,
      ...CSAA_POI_ROUTES,
      ...CSAA_DOCUMENT_ROUTES,
      ...CSAA_PAPERLESS_ROUTES,
    ],
  },
];

export const namedRoutes: NamedRouteConfig[] = [...PARENT_APP_ROUTES, ...CSAA_APP_ROUTES];
