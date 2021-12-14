import { CoverageResponse, Discount } from './policy.interface';

export interface Vehicle {
  id: string;
  name: string;
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  riskFactors: {
    waivedLiability: boolean;
    antiLockBrakes: boolean;
    antiTheft: boolean;
  };
}

export interface VehicleResponse {
  vin: string;
  vehicleIdentifier: string;
  make: string;
  model: string;
  year: string;
  bodyType: string;
  discounts: {
    discount: Discount[];
  };
  coverages: {
    deductible: {
      amount: string;
    };
    coverage: CoverageResponse[];
  };
  riskFactors: {
    numberOfDaysDrivenPerWeek: number;
    vehiclesSymbolCode: string;
    waivedLiabilityInd: string;
    antiLockBrakesInd: string;
    antiTheftInd: string;
  };
}
