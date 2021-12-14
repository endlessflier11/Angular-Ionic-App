import { Policy } from '../../interfaces';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ContactInfoAction {
  export class LoadContacts {
    static readonly type = '[CSAA:ContactInfoAction] LoadContacts';
    constructor(public policies: Policy[] = null) {}
  }
}
