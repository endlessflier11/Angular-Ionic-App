import { ConfigStateModel } from '../../../app/micro-apps/csaa-mobile/_core/store/states/state.interfaces';
import {
  CsaaConfigEnv,
  CsaaTheme,
  FetchStatus,
} from '../../../app/micro-apps/csaa-mobile/_core/interfaces';

export const CONFIG_STATE_FIXTURE_MOCK: ConfigStateModel = {
  isNative: false,
  hostAppReady: true,
  activeConfigData: {
    codeVersion: '5.5.0-3',
    theme: CsaaTheme.DEFAULT,
    rollbarDebugBuildNumber: '0',
    env: CsaaConfigEnv.QA,
    segmentToken: 'bWl5qrLeu7y0kIIkIqmDY9bTWwleQVzp',
    serviceLocatorUrl:
      'https://www-qa.mobile-mypolicy.digital.n01.csaa-insurance.aaa.com/servicelocator/v1',
    rollbarEnv: CsaaConfigEnv.QA,
    rollbarAccessToken: '1c5e215780aa40c28a9d1dc64bf659a5',
    apiKey: 'apiKey',
    walletPassId: 'pass.csaa.digital.mypolicy.poitest',
  },
  configLoaded: true,
  preferredTheme: CsaaTheme.DEFAULT,
  moduleRootPath: '/mobile/csaa',
  nonInsuredRedirectTo: null,
  nonInsuredRedirectToExternal: null,
  showHomeHeader: false,
  homeBackButtonRedirectTo: '/mobile/aca',
  handleIgToken: false,
  clubCode: '005',
  zipCode: null,
  webviewCookies: [],
  appEndpoints: {
    expireAt: new Date('2021-03-13T15:01:32.899Z'),
    endpoints: {
      mobileTranslatorService: 'mobileTranslatorService',
      mobileTranslatorServiceTempToken: 'mobileTranslatorServiceTempToken',
      mobileTranslatorServiceDeepLink: 'mobileTranslatorServiceDeepLink',
      getPaymentAccountToken: 'getPaymentAccountToken',
      health: 'health',
      billingAutopay: 'billingAutopay',
      billingFinancialInstitution: 'billingFinancialInstitution',
      billingHistory: 'billingHistory',
      billingPayment: 'billingPayment',
      billingSummary: 'billingSummary',
      billingWallet: 'billingWallet',
      billingWalletDelete: 'billingWalletDelete',
      claims: 'claims',
      contactInformation: 'contactInformation',
      contentLegal: 'contentLegal',
      coveragesGroup: 'coveragesGroup',
      coveragesGroups: 'coveragesGroups',
      customerProfile: 'customerProfile',
      customerSearch: 'customerSearch',
      customerSummary: 'customerSummary',
      paperlessEnrollmentAccepted: 'paperlessEnrollmentAccepted',
      paperlessPreferences: 'paperlessPreferences',
      policy: 'policy',
      policies: 'policies',
      policyDocument: 'policyDocument',
      policyDocuments: 'policyDocuments',
      policyDocumentSecure: 'policyDocumentSecure',
      policyDocumentByType: 'policyDocumentByType',
      policyEndorsements: 'policyEndorsements',
      policyDocumentBaseUrl: 'policyDocumentBaseUrl',
      billingInstallmentFees: 'billingInstallmentFees',
      paperlessTermsOfUseUrl: 'paperlessTermsOfUseUrl',
      proofOfInsuranceWalletPass: 'proofOfInsuranceWalletPass',
      mobileTranslatorServiceWalletPass: 'mobileTranslatorServiceWalletPass',
    },
  },
  endpointsLoadState: FetchStatus.SUCCESS,
  segmentLoaded: false,
  rollbarReady: false,
  storeInitialized: true,
};

export const CONFIG_STATE_INITIAL_FIXTURE_MOCK: ConfigStateModel = {
  isNative: false,
  hostAppReady: false,
  activeConfigData: null,
  configLoaded: false,
  preferredTheme: CsaaTheme.DEFAULT,
  moduleRootPath: null,
  nonInsuredRedirectTo: null,
  nonInsuredRedirectToExternal: null,
  showHomeHeader: false,
  homeBackButtonRedirectTo: '/',
  handleIgToken: false,
  clubCode: '005',
  zipCode: null,
  appEndpoints: null,
  endpointsLoadState: FetchStatus.NOT_FETCHED,
  segmentLoaded: false,
  rollbarReady: false,
  storeInitialized: false,
  webviewCookies: [],
};