import { CsaaConfigEnv, CsaaTheme, AppEndpointsData, CsaaConfigData } from '../../interfaces';
import { CookieJar } from '@aaa-mobile/capacitor-plugin';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ConfigAction {
  export class Setup {
    static readonly type = '[CSAA:ConfigActions] Setup';
    constructor(
      public env: CsaaConfigEnv,
      public theme: CsaaTheme,
      public data: CsaaConfigData & { [key: string]: any },
      public isNative: boolean
    ) {}
  }

  export class SetActiveConfig {
    static readonly type = '[CSAA:ConfigActions] SetActiveConfig';
    constructor(public key: CsaaConfigEnv) {}
  }

  export class SetAppEndpoints {
    static readonly type = '[CSAA:ConfigActions] SetAppEndpoints';
    constructor(public readonly appEndpointsData?: AppEndpointsData, public readonly error?: any) {}
  }

  export class LoadAppEndpoints {
    static readonly type = '[CSAA:ConfigActions] LoadAppEndpoints';
    constructor(public forceFromTheNetwork: boolean = false) {}
  }

  export class CompleteSegmentSetup {
    static readonly type = '[CSAA:ConfigActions] CompleteSegmentSetup';
  }

  export class CompleteRollbarSetup {
    static readonly type = '[CSAA:ConfigActions] CompleteRollbarSetup';
  }

  export class SetStoreInitialized {
    static readonly type = '[CSAA:ConfigActions] SetStoreInitialized';
  }

  export class SetWebviewCookies {
    static readonly type = '[CSAA:ConfigActions] SetWebviewCookies';
    constructor(public cookies: CookieJar[]) {}
  }
}
