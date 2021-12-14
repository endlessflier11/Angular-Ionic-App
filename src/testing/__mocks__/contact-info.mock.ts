import { CONTACT_INFO_RESPONSE, deepCopy } from '@app/testing';

export class ContactInfoResponseMock {
  private readonly model: { [key: string]: any };
  public static create(fixture = CONTACT_INFO_RESPONSE) {
    return new ContactInfoResponseMock(fixture);
  }

  constructor(fixture = CONTACT_INFO_RESPONSE) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }
}
