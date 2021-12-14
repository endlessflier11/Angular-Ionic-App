import { UpcomingPayment } from '../../app/micro-apps/csaa-mobile/_core/interfaces/payment.interface';
import {
  Policy,
  PolicyType,
} from '../../app/micro-apps/csaa-mobile/_core/interfaces/policy.interface';

export class AnalyticsMockService {
  startTracking = jest.fn();
  identify = jest.fn();
  trackPage = jest.fn();
  trackEvent = jest.fn();
  trackEventForCurrentTrackingScreen = jest.fn();
  getCurrentTrackingScreen = jest.fn();
  setCurrentTrackingScreen = jest.fn();

  public static mapPolicy(...policies: Policy[]) {
    return {
      policies: policies.map((p: Policy) => ({
        policy_number: p.number,
        policy_type: PolicyType[p.type],
        policy_state: p.riskState,
      })),
    };
  }
  public static mapPaymentPolicy(...payments: UpcomingPayment[]) {
    return {
      policies: payments.map((pmt) => ({
        policy_number: pmt.policyNumber,
        policy_type: PolicyType[pmt.policyType],
        policy_state: pmt.policyRiskState,
      })),
    };
  }
}
