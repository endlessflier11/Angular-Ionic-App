// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FetchAction {
  export class Reset {
    static readonly type = '[CSAA:FetchAction] Reset';
    constructor(public action: string) {}
  }

  export class Fetching {
    static readonly type = '[CSAA:FetchAction] Fetching';
    constructor(public action: string) {}
  }

  export class Success {
    static readonly type = '[CSAA:FetchAction] Success';
    constructor(public action: string) {}
  }

  export class Error {
    static readonly type = '[CSAA:FetchAction] Error';
    constructor(public action: string, public error: any) {}
  }
}
