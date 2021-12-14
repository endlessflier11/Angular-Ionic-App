export interface HoursOfOperation {
  days: string;
  hours: string;
}

export interface StateContactInfo {
  eService: string;
  customerService: string;
  customerServiceHoursOfOperation: HoursOfOperation[];
  claims: string;
  claimsHoursOfOperation: HoursOfOperation[];
  emergencyNumber: string;
}
