import { ProductType } from '../interfaces/document.interface';
import { InsuredRoleType, PolicyStatus, PolicyType } from '../interfaces/policy.interface';

export class PolicyHelper {
  static titleCase(input: string) {
    return input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  static typeCodeFromEnum(type: PolicyType, usePaymentCentralDomain = false) {
    switch (type) {
      case PolicyType.Auto:
        return usePaymentCentralDomain ? 'PA' : 'AU';
      case PolicyType.Home:
        return 'HO';
      case PolicyType.PUP:
        return usePaymentCentralDomain ? 'PU' : 'PUP';
      default:
        throw new Error('Unknown policy type');
    }
  }

  static statusToEnum(status: string): PolicyStatus {
    switch (status.toLowerCase()) {
      case 'active':
        return PolicyStatus.ACTIVE;
      case 'cancelled':
        return PolicyStatus.CANCELLED;
    }
  }

  static typeToEnum(type: string): PolicyType {
    switch (type) {
      case 'AU':
      case 'AUTO':
      case 'auto':
        return PolicyType.Auto;
      case 'HOME':
      case 'home':
      case 'HO':
        return PolicyType.Home;
      case 'umbrella':
      case 'pup':
      case 'PUP':
        return PolicyType.PUP;
    }
  }

  static insuredRoleTypeToEnum(roleType: string): InsuredRoleType {
    switch (roleType) {
      case 'INSURED':
        return InsuredRoleType.INSURED;
      case 'LISTED DRIVER':
        return InsuredRoleType.LISTED_DRIVER;
      case 'NAMED INSURED':
        return InsuredRoleType.NAMED_INSURED;
      default:
        throw new Error(`Unknown insured role type: ${roleType}`);
    }
  }

  static prodTypeFromPolicyType(policyType: PolicyType): ProductType {
    switch (policyType) {
      case PolicyType.PUP:
        return ProductType.Pup;
      case PolicyType.Home:
        return ProductType.Home;
      case PolicyType.Auto:
        return ProductType.Auto;
      default:
        throw new Error(`Unknown policy type: ${policyType}`);
    }
  }
  public static getPolicyTypeString(policyType: PolicyType): string {
    switch (policyType) {
      case PolicyType.PUP:
        return 'PU';
      case PolicyType.Auto:
        return 'AU';
      case PolicyType.Home:
        return 'HO';
      default:
        return 'AU';
    }
  }
}
