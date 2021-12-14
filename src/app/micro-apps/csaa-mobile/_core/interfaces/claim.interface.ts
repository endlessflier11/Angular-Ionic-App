import { PolicyType } from './policy.interface';
import { Vehicle } from './vehicle.interface';

// App model
export interface Claim {
  number: string;
  status: string;
  cause: string;
  type: PolicyType;
  policyNumber: string;
  vehicle: Vehicle;
  workflow: any[];
  adjuster?: any;
  address?: string;
}

export interface ClaimWorkflowEventResponse {
  description: string;
  date: string;
  eventType: string;
  title?: string;
}

// API model
export interface ClaimsResponse {
  claims: ClaimResponse[];
  status: string;
  message: string;
}

export interface ClaimResponse {
  claimNumber: string;
  type: string;
  dateOfLoss: string;
  claimsStatus: string;
  cause: string;
  openDate: string;
  closeDate: string;
  reportedDate: string;
  totalPaid: string;
  policyNumber: string;
  description: string;
  workflow: ClaimWorkflowEventResponse[];
  insuredParty: {
    name: string;
    drivingLicenseNumber: string;
    drivingLicenseState: string;
    age: string;
    relationToNamedInsured: string;
    dateOfBirth: string;
  };
  insuredObject: {
    model: string;
    make: string;
    manufacturedYear: string;
    bodyType: string;
    serialNumber: string;
    odometerReader: string;
  };
  adjuster: {
    name: string;
    telephoneNumber: string;
    emailAddress: string;
  };
}
