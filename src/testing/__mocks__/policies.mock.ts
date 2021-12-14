import { deepCopy } from '@app/testing';
import { SINGLE_POLICY_MOCK, MULTIPLE_POLICIES_MOCK } from '../fixtures';

export class PolicyResponseMock {
  private readonly model: { [key: string]: any };
  public static create(fixture = SINGLE_POLICY_MOCK) {
    return new PolicyResponseMock(fixture);
  }

  constructor(fixture = SINGLE_POLICY_MOCK) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }
}

export class PoliciesResponseMock {
  private readonly model: [{ [key: string]: any }];
  public static create(fixture = MULTIPLE_POLICIES_MOCK) {
    return new PoliciesResponseMock(fixture);
  }

  constructor(fixture = MULTIPLE_POLICIES_MOCK) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }

  public cancelPolicy(index = 0) {
    if (this.model && index >= 0 && index < this.model.length) {
      this.model[index].policyStatus = 'cancelled';
    }
    return this;
  }
}
