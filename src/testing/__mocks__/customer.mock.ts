import { deepCopy } from '@app/testing';
import { CUSTOMER_SINGLE_POLICY } from '../fixtures';

export class CustomerResponseMock {
  private model: { [key: string]: any };
  public static create(fixture = CUSTOMER_SINGLE_POLICY) {
    return new CustomerResponseMock(fixture);
  }

  constructor(fixture = CUSTOMER_SINGLE_POLICY) {
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
