export enum ProductType {
  Auto = 'auto',
  Home = 'home',
  Pup = 'pup',
}

export enum DocumentType {
  InsuranceCard = 'insuranceCard',
  Declarations = 'declarations',
}

export interface DocumentUrl {
  url: string;
}

export interface PolicyDocument {
  agreementEffectiveDate: string;
  externalURI: string;
  docName: string;
  docType: string;
  description: string;
  processDate: string;
  current?: boolean;
  isNew?: boolean;
  oid: string;
  category: string;
  policyNumber: string;
}

export enum PolicyDocumentType {
  NewBusiness = 'New Business',
  Cancellation = 'Cancellations',
  Renewal = 'Renewals',
  Endorsement = 'Endorsements',
  IDCard = 'ID Cards',
  DeclarationsPage = 'Declarations Page',
  Billing = 'Billing Documents',
  Payments = 'Payment Confirmations',
}

export const POLICY_DOCUMENTS_GROUP = [
  PolicyDocumentType.NewBusiness,
  PolicyDocumentType.Cancellation,
  PolicyDocumentType.Renewal,
  PolicyDocumentType.Endorsement,
  PolicyDocumentType.IDCard,
  PolicyDocumentType.DeclarationsPage,
];
export const BILLING_AND_PAYMENTS_GROUP = [PolicyDocumentType.Billing, PolicyDocumentType.Payments];
