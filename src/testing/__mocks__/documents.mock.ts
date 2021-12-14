import { deepCopy } from '@app/testing';
import { POLICY_DOCUMENTS_RESPONSE_MOCK } from '../fixtures/policy-document-mock.fixtures';

export class PolicyDocumentsResponseMock {
  private model: { [key: string]: any };
  public static create(fixture = POLICY_DOCUMENTS_RESPONSE_MOCK) {
    return new PolicyDocumentsResponseMock(fixture);
  }

  constructor(fixture = POLICY_DOCUMENTS_RESPONSE_MOCK) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }

  public patch(values) {
    this.model = { ...this.model, ...values };
    return this;
  }
}
