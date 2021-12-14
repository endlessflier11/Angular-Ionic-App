export enum WebDeeplinkLocation {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  CLAIMS = 'claims',
  ENDORSMENT = 'endorsement',
  ACCOUNT_SETTINGS = 'accountSettings',
  EDIT_POLICY_PAPERLESS_PREFERENCES = 'accountSettings',
  // EDIT_POLICY_PAPERLESS_PREFERENCES = 'accountSettings/policy/{policyNumber}/preferences',
  // EDIT_POLICY = 'accountSettings/policy/{policyNumber}',
  GET_WALLET_PASS = 'v1/passes/{walletPassId}/{policyNumber}',
}

export enum PaperlessEnrollmentStatus {
  pending = 'pending',
  accepted = 'accepted',
}

export interface User {
  hash: string;
}

export interface CustomerSearchResponse {
  mdmId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  customerAddress: {
    addressType: string;
    address1: string;
    address2?: string;
    zipCode: string;
    city: string;
    state: string;
    isPoBox?: boolean;
  };
  insuranceAddress: {
    address2: string;
    additional: string;
    addressType: string;
    address1: string;
    zipCode: string;
    city: string;
    state: string;
  };
  policies: CustomerSearchPolicyResponse[];
  hash: string;
  registrations?: Registration[];
  isPaperlessEnrollmentPending?: boolean;
}

export interface RoleResponse {
  sourceId: string;
  roleType: string;
  roleStatus: string;
}

export interface CustomerSearchPolicyResponse {
  policyNumber: string;
  policyStatus: string;
  policyType: string;
  clubCode: string;
  riskState: string;
  prodTypeCode: string;
  termExpirationDate: string;
  roleList: RoleResponse[];
  insuranceAddress: {
    address1: string;
    address2: string;
    additional: string;
    addressType: string;
    zipCode: string;
    city: string;
    state: string;
    siteDomain: string;
    phone: string;
    streetAddressLine: string;
    stateFullName: string;
  };
}

export interface Registration {
  registrationId?: string;
  registrationSource?: string;
  startDate?: string;
}

export interface MwgSsoAuthResponse {
  accessToken: string;
  idToken: string;
  state: string;
  expiresIn: number;
}

export interface AAAOAuthAuthResponse {
  code: string;
  clubcode: string;
  state: string;
}

export interface WebDeeplinkInitializationPayload {
  pageURI: WebDeeplinkLocation | string;
  accessToken: string;
  idToken: string;
}

export interface WebDeeplinkInitializationResponse {
  tempToken: string;
  expiresIn: number;
}
