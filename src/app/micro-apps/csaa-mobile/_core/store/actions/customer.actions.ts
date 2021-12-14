// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomerAction {
  export class Reset {
    static readonly type = '[CSAA:CustomerAction] Reset';
  }

  export class LoadCustomer {
    static readonly type = '[CSAA:CustomerAction] LoadCustomer';
    constructor() {}
  }

  export class ReloadCustomer {
    static readonly type = '[CSAA:CustomerAction] ReloadCustomer';
  }

  export class AcceptPaperlessTerms {
    static readonly type = '[CSAA:CustomerAction] AcceptPaperlessTerms';
  }
}
