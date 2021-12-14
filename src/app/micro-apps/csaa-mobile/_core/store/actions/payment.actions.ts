import { PaymentType } from '../../interfaces';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PaymentAction {
  export class Reset {
    static readonly type = '[CSAA:PaymentAction] Reset';
  }

  export class LoadPayments {
    static readonly type = '[CSAA:PaymentAction] LoadPayments';
  }
  export class ReloadPayments {
    static readonly type = '[CSAA:PaymentAction] ReloadPayments';
  }

  export class LoadHistory {
    static readonly type = '[CSAA:PaymentAction] LoadHistory';
  }
  export class ReloadHistory {
    static readonly type = '[CSAA:PaymentAction] ReloadHistory';
  }

  export class LoadWallet {
    static readonly type = '[CSAA:PaymentAction] LoadWallet';
  }
  export class ReloadWallet {
    static readonly type = '[CSAA:PaymentAction] ReloadWallet';
  }

  export class UpdateAutoPay {
    static readonly type = '[CSAA:PaymentAction] UpdateAutoPay';
    constructor(public policyNumber: string, public readonly isActive: boolean = false) {}
  }

  export class UpdatePaymentTypeAmount {
    static readonly type = '[CSAA:PaymentAction] UpdatePaymentTypeAmount';
    constructor(
      public policyNumber: string,
      public type: PaymentType,
      public otherAmount: number
    ) {}
  }
}
