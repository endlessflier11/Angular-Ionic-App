import {
  AppEndpointsData,
  BillState,
  CsaaTheme,
  CustomerSearchResponse,
  FetchStatus,
  PaymentHistory,
  Policy,
  UpcomingPayment,
  WalletDetails,
} from '../../interfaces';
import { Claim } from '../../interfaces/claim.interface';
import { CsaaConfig, CsaaTokens } from '../../services';
import { PolicyDocument } from '../../interfaces/document.interface';
import { CookieJar } from '@aaa-mobile/capacitor-plugin';

export const CSAA_APP_STATE_TOKEN = 'csaa_app';

export interface AuthStateModel {
  accessToken: CsaaTokens;
  igAccessToken: CsaaTokens;
  loggedIn: boolean;
  user: string;
  username: string;
  custKey: string;
}

export const CSAA_AUTH_STATE_TOKEN = 'csaa_auth';

export interface ConfigStateModel {
  isNative: boolean;
  hostAppReady: boolean;
  activeConfigData: CsaaConfig;
  configLoaded: boolean;
  endpointsLoadState: FetchStatus;
  preferredTheme: CsaaTheme;
  moduleRootPath: string;
  nonInsuredRedirectTo: string;
  nonInsuredRedirectToExternal: string;
  appEndpoints: AppEndpointsData;
  showHomeHeader: boolean;
  homeBackButtonRedirectTo: string;
  segmentLoaded: boolean;
  rollbarReady: boolean;
  handleIgToken: boolean;
  clubCode: string;
  zipCode: string;
  storeInitialized: boolean;
  webviewCookies: CookieJar[];
}

export const CONFIG_STATE_TOKEN = 'csaa_config';

export interface CustomerStateModel {
  data: CustomerSearchResponse;
}

export const CUSTOMER_STATE_TOKEN = 'csaa_customer';

export type PolicyStateModel = {
  policies: Policy[];
  documents: {
    [policyNumber: string]: PolicyDocument[];
  };
  allowedEndorsements: {
    [policyNumber: string]: string[] | null;
  };
  activeDocument: PolicyDocument;
};

export const POLICY_STATE_TOKEN = 'csaa_policies';

export interface PaymentStateModel {
  payments: UpcomingPayment[];
  wallet: WalletDetails;
  history: PaymentHistory;
  bills: BillState;
}
export const PAYMENT_STATE_TOKEN = 'csaa_payment';

export type ClaimStateModel = Claim[];

export const CLAIM_STATE_TOKEN = 'csaa_claims';
