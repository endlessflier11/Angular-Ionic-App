import { Agent } from './agent.interface';
import { DriverCoverageType } from './driver.interface';
import { Vehicle, VehicleResponse } from './vehicle.interface';

export const POLICY_LIMIT_CANCELED_DAYS = 35;

export enum PolicyStatus {
  ACTIVE,
  CANCELLED,
}

export enum PolicyType {
  PUP,
  Home,
  Auto,
}

export enum EValueEnrollmentStatus {
  ACTIVE,
  PENDING,
}

export interface CoverageExtension {
  attrName: string;
  attrValue: boolean | number;
}

export interface Coverage {
  shortName: string;
  twitterPitch?: string;
  deductible?: { isPresent: boolean; value: number };
  shortDesc?: string;
  individualLimit?: number;
  individualLimitDelimiter?: string;
  occurrenceLimit?: number;
  occurrenceLimitDelimiter?: string;
  combinedSingleLimitAmount?: number;
  covered: boolean;
  code: string;
  label: string;
  general: boolean;
  coverages: Coverage[];
  extensions: CoverageExtension[];
}

export interface DriverResponse {
  firstName: string;
  lastName: string;
  fullName: string;
  issuedDate: string;
  issuedState: string;
  gender: string;
  totalDisabilityIndicator: string;
  dob: string;
  type: string;
  licenseNumber: string;
  adbCoverageIndicator: string;
  excludedFromPolicy: string;
  coverages: {
    deductible: {
      amount: string;
    };
    coverage: CoverageResponse[];
  };
  discounts?: {
    discount: [
      {
        code: string;
        description: string;
        amount: string;
      }
    ];
  };
  namedInsuredIdentifier: string;
}

export interface AgentResponse {
  fullName: string;
  telephoneNumber: string;
  emailAddress: string;
  agentIdentifier: string;
  firstName: string;
  lastName: string;
  generalNumber: string;
  agency: string;
  producerNumber: string;
  address: {
    addressType: string;
    address1: string;
    streetAddressLine: string;
    zipCode: string;
    city: string;
    state: string;
    stateFullName: string;
  };
}

export interface CoverageResponse {
  description: string;
  sequence: number;
  label: string;
  code: string;
  shortDesc?: string;
  twitterPitch?: string;
  deductible?: {
    amount?: {
      isPresent: boolean;
      value: number;
    };
  };
  shortName: string;
  general: boolean;
  limit?: {
    displayValue?: string;
    individualLimitAmount?: number;
    individualLimitDelimiter?: string;
    occurrenceLimitAmount?: number;
    occurrenceLimitDelimiter?: string;
    individualLimitType?: string;
    occurrenceLimitType?: string;
    combinedSingleLimitAmount?: number;
  };
  coveragePremium: {
    actualPremium: string;
    annualPremium: string;
    changePremium: string;
  };
  grandfathered: boolean;
  covered: boolean;
  extensions: CoverageExtension[] | null;
  coverages: CoverageResponse[];
}

export interface VehicleWithCoverage extends Vehicle {
  coverages: Coverage[];
}

export interface CustomerPolicies {
  customerFirstName: string;
  policies: Policy[];
}

export interface EValueEnrollment {
  status: EValueEnrollmentStatus;
}

export interface Policy {
  type: PolicyType;
  id: string;
  subtitle: string;
  number: string;
  status: PolicyStatus;
  agent?: Agent;
  coverages?: Coverage[];
  // home specific
  // eslint-disable-next-line @typescript-eslint/ban-types
  deductible?: string | object;
  productClass?: string;
  address?: string;
  // auto specific
  drivers?: PolicyDriver[];
  vehicles?: VehicleWithCoverage[];
  insureds?: Insured[];
  riskState: string;
  productCode: string;
  policyPrefix: string;
  gracePeriod?: boolean;
  termEffectiveDate?: string;
  termExpirationDate?: string;
  eValueEnrollment?: EValueEnrollment;
}

export interface PolicyDriver {
  id: string;
  fullName: string;
  dob: Date;
  coverageType: DriverCoverageType;
  coverages: any;
}

export enum InsuredRoleType {
  INSURED = 'INSURED',
  LISTED_DRIVER = 'LISTED DRIVER',
  NAMED_INSURED = 'NAMED INSURED',
}

export interface Insured {
  id: string;
  isActive: boolean;
  primary: boolean;
  firstName: string;
  lastName: string;
  roleType?: InsuredRoleType;
}

export interface Discount {
  code: string;
  description: string;
  amount: string;
}

export interface PolicyResponse {
  vehicles: VehicleResponse[];
  clubCode: string;
  writingCompany: string;
  effectivePolicyStatus: string;
  transactionEffectiveDate: string;
  cancelNoticeInd: boolean;
  dataSource: string;
  drivers: DriverResponse[];
  agent: AgentResponse;
  coverages: {
    deductible: {
      amount: string;
    };
    coverage: CoverageResponse[];
  };
  policyNumber: string;
  policyStatus: string;
  policyType: string;
  productCode: string;
  policyPrefix: string;
  statusDate: string;
  // home specific
  deductible?: string;
  productClass?: string;
  dwelling?: DwellingResponse;
  status: string;
  message: string;
  insureds: InsuredResponse[];
  riskState: string;
  termEffectiveDate: string;
  termExpirationDate: string;
  premiumDetails: string;
  gigShareDetails: string;

  discounts?: {
    discount: Discount[];
  };

  eValueInfo?: {
    eft: boolean;
    enrollmentStatus: string;
    optInIndicator: string;
    pciCreditCard: boolean;
    pciDebitCard: boolean;
  };
}

export interface InsuredResponse {
  sourceId: string;
  primary: boolean;
  firstName: string;
  lastName: string;
  personNameIdentifier?: string;
}

export interface DwellingResponse {
  address: {
    addressType?: string;
    address1: string;
    streetAddressLine: string;
    zipCode: string;
    city: string;
    state: string;
    stateFullName?: string;
  };
}

export interface IndentedCoverageDetails {
  coverage: Coverage;
  agent: Agent;
  policyType: PolicyType;
  policyNumber: string;
  title?: string;
}

export enum NotificationChannelItem {
  POLICY_DOCUMENTS = 'POLICY_DOCUMENTS',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  BILL_NOTIFICATION = 'BILL_NOTIFICATION',
  AUTOPAY_ALERT = 'AUTOPAY_ALERT',
}

export enum PaperlessNotificationsStatus {
  OPT_IN = 'OPT_IN',
  OPT_IN_PENDING = 'OPT_IN_PENDING',
  OPT_OUT = 'OPT_OUT',
}

interface PaperlessNotificationDetails {
  preferenceType: keyof typeof NotificationChannelItem;
  preferenceAction: keyof typeof PaperlessNotificationsStatus;
}

export interface PolicyPaperlessPreference {
  policyNumber: string;
  email: {
    enabled?: boolean;
    isPending?: boolean;
    email?: string;
    notifications?: (keyof typeof NotificationChannelItem)[];
    notificationsDetail?: PaperlessNotificationDetails[];
  };
  sms: {
    enabled?: boolean;
    phoneNumber?: string;
    notifications?: (keyof typeof NotificationChannelItem)[];
    notificationsDetail?: PaperlessNotificationDetails[];
  };
}

export type PolicyPaperlessPreferencesApiResponse = PolicyPaperlessPreference[];
