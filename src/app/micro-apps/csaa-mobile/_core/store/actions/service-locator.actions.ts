import { AppEndpointsData } from '../../interfaces';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ServiceLocatorAction {
  export class SetAppEndpoints {
    static readonly type = '[CSAA:ServiceLocatorAction] SetAppEndpoints';
    constructor(public appEndpointsData: AppEndpointsData) {}
  }

  export class LoadAppEndpoints {
    static readonly type = '[CSAA:ServiceLocatorAction] LoadAppEndpoints ';
    constructor(
      public isBrowser: boolean,
      public serviceLocatorUrl: string,
      public forceFromTheNetwork: boolean = false
    ) {}
  }
}
