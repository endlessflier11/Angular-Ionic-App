import { deepCopy } from '@app/testing';
import {
  BILLING_HISTORY_RESPONSE_SINGLE_POLICY,
  BILLING_SUMMARY_SINGLE_POLICY_MOCK,
} from '../fixtures';

export class BillingHistoryResponseMock {
  private readonly model: { [key: string]: any };
  public static create(fixture = BILLING_HISTORY_RESPONSE_SINGLE_POLICY) {
    return new BillingHistoryResponseMock(fixture);
  }

  constructor(fixture) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }

  public whenEmpty() {
    this.model.billingHistoryPoliciesResponse.forEach((h) => {
      h.payments = [];
    });
    return this;
  }
}

export class BillingSummaryResponseMock {
  private readonly model: { [key: string]: any };
  public static create(fixture = BILLING_SUMMARY_SINGLE_POLICY_MOCK) {
    return new BillingSummaryResponseMock(fixture);
  }

  constructor(fixture = BILLING_SUMMARY_SINGLE_POLICY_MOCK) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }

  withPaymentDue(index = 0) {
    this.model.billingSummaries[index].bill.isPaymentDue = true;
    return this;
  }

  withPaymentPastDue(index = 0) {
    this.model.billingSummaries[index].bill.isPastDue = true;
    return this;
  }
}
