import { PolicyType } from './policy.interface';

export enum PaymentStatus {
  PAID = 'Paid',
  FAILED = 'Failed',
  PENDING = 'Pending',
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  CASH = 'Cash',
  CHECK = 'Check',
  EFT = 'Electronic Funds Transfer',
  EMPTY = '',
}

export enum PaymentPlanType {
  ANNUAL,
  SEMIANNUAL,
  QUARTERLY,
  MONTHLY,
}

export enum PaymentType {
  minimum = 'minimum',
  remaining = 'remaining',
  other = 'other',
}

export interface Payment {
  dueDate: Date;
  amount: number;
  policyNumber: string;
}

export interface UpcomingPayment extends Payment {
  vehicles: string[];
  subtitle: string;
  autoPay?: boolean;
  minimumAmount?: number;
  remainingPremium?: number;
  otherAmount?: number;
  type?: PaymentType;
  nextDueDate?: Date;
  nextAmount?: number;
  allPolicies: boolean;
  policyNumber: string;
  policyType: PolicyType;
  isPastDue: boolean;
  isPaymentDue: boolean;
  amount: number;
  policyRiskState: string;
  autopayEnrollment?: AutoPayEnrollmentResponse;
  autopayInstallmentFee?: InstallmentFee;
}

export interface LineItems {
  amount: string;
  policyInfo: {
    policyNumber: string;
    prodTypeCode: string;
    policyPrefix: string;
  };
}

interface PaymentMethodData {
  saveForFuture: string;
}

export interface NewPaymentMethodCardData extends PaymentMethodData {
  shortName: string;
  isPreferred: boolean;
  cardHolderName: string;
  cardNumber: string;
  cardExpirationDate: string;
  cardZip: string;
  last4digits?: string;
}

export interface NewPaymentMethodAccountData extends PaymentMethodData {
  accountNumber: string;
  accountHolderName: string;
  routingNumber: string;
  nickname: string;
  bankAccountType: string;
}

export class UpcomingPaymentModel implements UpcomingPayment {
  dueDate: Date;
  policyNumber: string;
  vehicles: string[];
  autoPay?: boolean;
  subtitle: string;
  minimumAmount: number;
  remainingPremium: number;
  otherAmount: number;
  type: PaymentType;
  nextDueDate: Date;
  nextAmount?: number;
  allPolicies: boolean;
  policyType: PolicyType;
  isPastDue: boolean;
  isPaymentDue: boolean;
  policyRiskState: string;

  constructor(data: any | UpcomingPayment) {
    this.dueDate = data.dueDate;
    this.policyNumber = data.policyNumber;
    this.vehicles = data.vehicles;
    this.subtitle = data.subtitle;
    this.autoPay = data.autoPay;
    this.minimumAmount = data.minimumAmount;
    this.remainingPremium = data.remainingPremium;
    this.otherAmount = data.otherAmount;
    this.type = data.type;
    this.nextDueDate = data.nextStatementDate;
    this.allPolicies = data.allPolicies || false;
    this.policyType = data.policyType;
    this.isPastDue = data.isPastDue;
    this.isPaymentDue = data.isPaymentDue;
    this.nextAmount = data.nextInstallmentAmount;
    this.policyRiskState = data.policyRiskState;
  }

  get amount() {
    // Todo: replace hardcoded values with this switch
    // switch (this.type) {
    //   case PaymentType[PaymentType.minimum]:
    //     return this.minimumAmount;
    //   case PaymentType[PaymentType.remaining]:
    //     return this.remainingPremium;
    //   default:
    //     return this.minimumAmount;
    // }

    switch (this.type) {
      case 'minimum':
        return this.minimumAmount;
      case 'remaining':
        return this.remainingPremium;
      default:
        return this.minimumAmount;
    }
  }

  static getPaymentFilterByFn(type: PaymentType) {
    switch (type) {
      case PaymentType.minimum:
        return (p: UpcomingPayment) => p.minimumAmount > 0;
      case PaymentType.remaining:
        return (p: UpcomingPayment) => p.remainingPremium > 0;
      case PaymentType.other:
        return (p: UpcomingPayment) => p.otherAmount > 0;
      default:
        return (p: UpcomingPayment) => p.minimumAmount > 0;
    }
  }
}

export interface PaymentHistoryEntry {
  amount: string;
  paymentMethod: string;
  policyEffectiveDate: string;
  policyExpirationDate: string;
  referenceNumber: string;
  status: string;
  subType: string;
  transactionDate: string;
  userID: string;
}

export interface PaymentHistory {
  [policyNumber: string]: PaymentHistoryEntry[];
}

export enum PaymentBankAccountType {
  CHECKING = 'CHKG',
  SAVINGS = 'SAVG',
}

export enum PaymentAccountType {
  CARD = 'CRDC',
  EFT = 'EFT',
}

export interface PaymentAccount {
  account?: {
    institution: {
      routingNumber: string;
    };
    accountNumber: string;
    number?: string; // deprecated
    holderName: string;
    type: string;
    bankAccountType?: string; // deprecated
  };
  card?: {
    holderName: string;
    type: string;
    last4digits: string;
    printedName: string;
    zipCode: string;
    expirationDate?: string;
    expired?: boolean;
    isDebitCard?: boolean;
  };
  isPreferred: boolean;
  paymentAccountToken: string;
  shortName: string;
}

export interface OneTimePaymentAccount {
  token: string;
  cardType?: string;
  isDebitCard?: boolean;
}

export interface WalletDetails {
  ownerId?: string;
  walletId?: string;
  paymentAccounts: PaymentAccount[];
}

export interface RetrieveWalletDetailResponse {
  ownerId: string;
  walletId: string;
  paymentAccounts: PaymentAccount[];
}

export interface BillResponse {
  transactionDate: string;
  amount: string;
  referenceNumber: string;
  policyEffectiveDate: string;
  policyExpirationDate: string;
  priorBalance: string;
  totalAmountDue: string;
  dueDate: string;
  paymentPlan: string;
  billedTo: string;
}

export interface Bill extends BillResponse {
  policyNumber: string;
  policyType: PolicyType;
  subtitle: string;
}

export interface BillState {
  [policyNumber: string]: Bill[];
}

export interface PaymentHistoryResponse {
  billingHistoryPoliciesResponse: [
    {
      policyNumber: string;
      riskState: string;
      bills: BillResponse[];
      payments: [
        {
          transactionDate: string;
          amount: string;
          referenceNumber: string;
          subType: string;
          userID: string;
          policyEffectiveDate: string;
          policyExpirationDate: string;
          paymentMethod: string;
          paymentAccountLast4: string;
          checkNumber: string;
          postmarkDate: string;
          status: string;
        }
      ];
    }
  ];
}

export interface PaymentSummaryResponse {
  billingSummaries: BillingSummary[];
}

export interface BillingSummary {
  policyNumber: string;
  remainingInstallments: string;
  currentBalance: string;
  payOffAmount: string;
  autoPay: string;
  paymentRestriction: string;
  nextInstallmentAmount: string;
  nextStatementDate: string;
  bill: {
    installmentNumber: string;
    statementDate: string;
    dueDate: string;
    previousBalance: string;
    installmentAmount: string;
    totalBillAmountDue: string;
    paymentPlan: string;
    billingPlan: string;
    isPastDue: boolean;
    isPaymentDue: boolean;
  };
  lastPayment: {
    paymentDateTime: string;
    paymentMethod: string;
    amount: string;
    status: string;
  };
  isRestrictedToPay: string;
  paid: boolean;
  nextDueDate: string;
}

export interface RoutingNumberDetailsResponse {
  shortName: string;
  fullName: string;
  address: {
    cityName: string;
    zipCode: string;
    isoRegionCode: string;
    streetAddressLine: string;
  };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ACHCapable: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ACHNumber: string;
  routingNumber: string;
  routingNumberType: string;
  routingNumberDescription: string;
  routingNumberStatus: string;
  routingNumberStatusDescription: string;
}

export interface RegisterPaymentAccountOptions {
  registrationId: any;
  shortName: string;
  isPreferred: boolean;
  saveForFuture: 'Y' | 'N';
}

export interface BaseRegisterPaymentAccountPayload {
  paymentAcctFopType?: PaymentAccountType;
  paymentSourceSystem?: 'MOBIAPP';
  userId?: 'mobile_app_user';
  corellationId?: string; // Unique string
}

export interface RegisterCardPaymentAccountPayload extends BaseRegisterPaymentAccountPayload {
  paymentCardNumber: string;
  paymentCardHolderName: string;
  paymentCardExpirationDate: string;
  paymentCardZip: string;
}

export interface RegisterEFTPaymentAccountPayload extends BaseRegisterPaymentAccountPayload {
  pmtSourcePhoneNumber: string;
  paymentBankAccountNumber: string;
  paymentBankAccountHolderName: string;
  paymentBankAccountType: PaymentBankAccountType;
  fiRoutingNumber: string;
}

export interface RegisterPaymentAccountResponse {
  paymentSourceSystem: 'MOBIAPP';
  userId: 'mobile_app_user';
  paymentAccountToken: string;
  paymentAcctFopType: PaymentAccountType;

  // card
  paymentCardLast4?: string;
  paymentCardSubType?: string; // "Credit",
  paymentCardHolderName?: string;
  paymentCardExpirationDate?: string; // '2020-05-01 07:00',
  paymentCardType?: string;

  // eft
  paymentBankAccountLast4?: string;
  paymentBankAccountHolderName?: string;
  paymentBankAccountType?: PaymentBankAccountType;
  fiRoutingNumber?: string;
  paymentBankName?: string;
}

export interface MakePaymentPayload {
  totalAmount: string;
  hash: string;
  testing: boolean;
  lineItems: {
    amount: string;
    policyInfo: {
      policyNumber: string;
      prodTypeCode: string;
      policyPrefix: string;
    };
  }[];
  paymentItem: {
    paymentAccountToken: string;
    paymentMethod: PaymentAccountType;
    card?: {
      zipCode: string;
    };
  };
  userDeviceMetadata: {
    uuid: string;
  };
  club: string;
}

export interface MakePaymentResponse {
  receiptNumber: string;
  statusDescription: string;
}

export interface PaymentWithAutopayEnrollmentResponse extends MakePaymentResponse {
  enrollmentSucceded?: boolean;
}

export interface AutoPayEnrollmentResponse {
  enrollmentRecord: {
    receiptNumber: string; // '660756';
    action: string; // 'ENROLL';
    authenticationChannel: string; // 'ONL';
    sourceApplicationUsed: string; // 'PAS';
    lastUpdatedBy: string; // 'U500015757';
    lastUpdatedOn: string; // '2020-10-09T14:20:29.35-07:00';
    lastUpdatedWorkstationIP: string; // '192.168.27.213';
    billingSystemUpdateStatus: string; // 'ASMD';
    enrollmentEffectiveDate: string; // '2020-10-09';
    paymentItem: {
      paymentMethod: PaymentAccountType; // 'EFT';
      type: string; // 'INST';
      paymentAccountToken: string; // 'BD5743A3-65DB-867F-D9B2-B8764E30C937';
      card: {
        number: string; // '5454';
        type: string; // 'MASTR';
        printedName: string; // 'TEST USER';
        expirationDate: string; // '2025-12-01';
        isCardPresent: boolean;
        zipCode: string;
      };
      account: {
        type: PaymentBankAccountType; // 'CHKG';
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ABANumber: string; // '211370396';
        accountNumber: string; // '5601';
        accountHolderName: string; // 'Test Account';
        bankName: string; // 'AVIDIA BANK';
      };
    };
  };
  policyNumber: string; // 'AZH6910018928';
  dataSource: string; // 'PAS';
  policyType: string; // 'HO';
  autoPay: boolean;
}

export interface AutoPayEnrollment {
  [policyNumber: string]: AutoPayEnrollmentResponse;
}

export interface PaymentAccountLabel {
  text: string;
  primaryText: string;
  secondaryText: string;
}

export interface PolicyPaymentResult {
  result: boolean;
  receiptNumber: string;
  paymentAccount: PaymentAccount;
  date: string;
  amount: number;
}

export interface PaymentResult {
  [policyNumber: string]: PolicyPaymentResult;
}

export interface InstallmentFee {
  autoPayFees: { eft: number; pciCreditCard: number; pciDebitCard: number };
  otpFees: { eft: number; pciCreditCard: number; pciDebitCard: number };
}
