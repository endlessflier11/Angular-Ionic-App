import { PolicyType } from './policy.interface';

export interface UserAnalyticsMetadata {
  uuid?: string;
  mdm_id?: string;
  email?: string;
  mdm_email?: string;
  club_code?: string;
  policies?: {
    type: PolicyType;
    number: string;
    riskState: string;
  }[];
  // isGuestUser property is being sent to segment
  // adding it here just to make it explicit
  isGuestUser?: boolean;
}

export interface ApplicationContextMetadata {
  userId: string;
  correlationId: string;
  transactionType?: 'read' | 'write';
  application?: 'MyPolicyMobile';
  subSystem?: 'CUSTPRL';
  address?: string;
}
