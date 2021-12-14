import { PolicyDocument } from '../../interfaces/document.interface';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PolicyAction {
  export class Reset {
    static readonly type = '[CSAA:PolicyAction] Reset';
  }

  export class LoadPolicies {
    static readonly type = '[CSAA:PolicyAction] LoadPolicies';
  }

  export class ReloadPolicies {
    static readonly type = '[CSAA:PolicyAction] ReloadPolicies';
  }

  export class LoadPolicyDocuments {
    static readonly type = '[CSAA:PolicyAction] LoadPolicyDocuments';
    constructor(public policyNumber: string) {}
  }

  export class ReloadPolicyDocuments {
    static readonly type = '[CSAA:PolicyAction] ReloadPolicyDocuments';
    constructor(public policyNumber: string) {}
  }

  export class RefreshActiveDocument {
    static readonly type = '[CSAA:PolicyAction] RefreshActiveDocument';
    constructor(public policyNumber: string, public activeDocument: PolicyDocument) {}
  }

  export class ClearActiveDocument {
    static readonly type = '[CSAA:PolicyAction] ClearActiveDocument';
  }
  export class LoadAllowedEndorsements {
    static readonly type = '[CSAA:PolicyAction] LoadAllowedEndorsements';
    constructor(public policyNumber: string) {}
  }

  export class ReloadAllowedEndorsements {
    static readonly type = '[CSAA:PolicyAction] ReloadAllowedEndorsements';
    constructor(public policyNumber: string) {}
  }
}
