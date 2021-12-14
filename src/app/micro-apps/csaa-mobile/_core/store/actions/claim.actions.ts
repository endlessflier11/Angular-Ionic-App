// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClaimAction {
  export class Reset {
    static readonly type = '[CSAA:ClaimAction] Reset';
  }

  export class LoadClaims {
    static readonly type = '[CSAA:ClaimAction] LoadClaims';
  }

  export class ReloadClaims {
    static readonly type = '[CSAA:ClaimAction] ReloadClaims';
  }
}
