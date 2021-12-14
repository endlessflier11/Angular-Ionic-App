export enum CsaaConfigEnv {
  PROD = 'production',
  QA = 'qa',
  DEV = 'dev',
  PERF = 'perf',
  BFIX = 'bfix',
}

export interface CsaaConfigData {
  moduleRootPath: string;
  nonInsuredRedirectTo?: string;
  nonInsuredRedirectToExternal?: string;
  showHomeHeader?: boolean;
  homeBackButtonRedirectTo?: string;
  handleIgToken?: boolean;
  clubCode?: string;
}

export interface CsaaSharedEnvConfig {
  codeVersion: string;
  theme: CsaaTheme;
  rollbarDebugBuildNumber: string;
}

export interface CsaaConfig extends CsaaSharedEnvConfig {
  env: CsaaConfigEnv;
  segmentToken: string;
  serviceLocatorUrl: string;
  rollbarEnv: CsaaConfigEnv;
  rollbarAccessToken: string;
  apiKey: string;
  walletPassId: string;
}

export interface CsaaThemeColors {
  primary: string;
  webview: string;
}

export enum CsaaTheme {
  DEFAULT = '',
  MWG = 'theme-mwg',
  ACA = 'theme-aca',
}

export enum AppEndpointsEnum {
  mobileTranslatorService,
  mobileTranslatorServiceTempToken,
  mobileTranslatorServiceDeepLink,
  getPaymentAccountToken,
  health,
  billingAutopay,
  billingFinancialInstitution,
  billingHistory,
  billingPayment,
  billingSummary,
  billingWallet,
  billingWalletDelete,
  claims,
  contactInformation,
  contentLegal,
  coveragesGroup,
  coveragesGroups,
  customerProfile,
  customerSearch,
  customerSummary,
  policy,
  policies,
  policyDocument,
  policyDocuments,
  policyDocumentByType,
  policyDocumentSecure,
  paperlessEnrollmentAccepted,
  paperlessPreferences,
  policyEndorsements,
  policyDocumentBaseUrl,
  billingInstallmentFees,
  paperlessTermsOfUseUrl,
  proofOfInsuranceWalletPass,
  mobileTranslatorServiceWalletPass,
}

export type AppEndpointKey = keyof typeof AppEndpointsEnum;

export type AppEndpoints = {
  [k in AppEndpointKey]: string;
};

export type AppEndpointsData = {
  expireAt?: Date;
  endpoints: AppEndpoints;
  publicEndpointKeys?: AppEndpointKey[];
};

// When altering the structure of this response, it'll be a good idea to
// start the change from the API and only release the FE version when we're
// sure the cache may have expired.ext
// ALTERNATIVELY, we can version the response so as to reject cached version when necessary.
export interface AppEndpointsResponse {
  endpoints: {
    [k in AppEndpointKey]: {
      url: string;
      isPublic?: boolean;
    };
  };
}
