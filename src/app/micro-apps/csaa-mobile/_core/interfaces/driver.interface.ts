import { Coverage } from './policy.interface';

export enum DriverCoverageType {
  Rated,
  Excluded,
  NotRated,
}

export interface DriverCoverage {
  id: string;
  fullName: string;
  dob: Date;
  coverageType: DriverCoverageType;
  coverages: Coverage[];
}
