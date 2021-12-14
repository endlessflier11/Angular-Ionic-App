import { CsaaTokens, CsaaTokensManaged } from '../../services';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CsaaAuthAction {
  export class SetAccessToken {
    static readonly type = '[CSAA:AuthAction] SetAccessToken';
    constructor(public tokens: CsaaTokensManaged) {}
  }

  export class SetIgAccessToken {
    static readonly type = '[CSAA:AuthAction] SetIgAccessToken';
    constructor(public tokens: CsaaTokens) {}
  }

  export class Logout {
    static readonly type = '[CSAA:AuthAction] Logout';
  }

  export class RequestIgAccessToken {
    static readonly type = '[CSAA:AuthAction] RequestIgAccessToken';
    constructor(public tokens: CsaaTokensManaged) {}
  }

  export class CheckTokenExpired {
    static readonly type = '[CSAA:AuthAction] CheckTokenExpired';
  }
}
