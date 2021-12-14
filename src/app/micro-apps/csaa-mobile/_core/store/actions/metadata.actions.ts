import { PolicyType } from '../../interfaces';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MetadataAction {
  export class ResetMetadata {
    static readonly type = '[CSAA:MetadataAction] ResetMetadata';
  }

  export class Initialize {
    static readonly type = '[CSAA:MetadataAction] Initialize';
    constructor(public email: string, public clubCode: string, public isGuestUser: boolean) {}
  }

  export class SetProperties {
    static readonly type = '[CSAA:MetadataAction] SetProperties';
    // Todo: Partial<MetadataStateModel> and check for cyclic deps
    constructor(
      public props: {
        uuid?: string;
        mdmId?: string;
        mdm_email?: string;
        clubCode?: string;
        policies?: {
          type: PolicyType;
          number: string;
          riskState: string;
        }[];
      }
    ) {}
  }

  export class SetConstants {
    static readonly type = '[CSAA:MetadataAction] SetConstants';
    constructor(public deviceUuid: string, public clubCode: string) {}
  }
}
