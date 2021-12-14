import { FetchStatus } from '../interfaces';
import {
  AuthStateModel,
  CONFIG_STATE_TOKEN,
  ConfigStateModel,
  CSAA_APP_STATE_TOKEN,
  CSAA_AUTH_STATE_TOKEN,
  CUSTOMER_STATE_TOKEN,
  CustomerStateModel,
} from './states/state.interfaces';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ConfigSelector {
  export const state = (appState: { csaa_app: { csaa_config: ConfigStateModel } }) =>
    appState[CSAA_APP_STATE_TOKEN][CONFIG_STATE_TOKEN];

  export const configAndEndpointsLoaded = (appState: {
    csaa_app: { csaa_config: ConfigStateModel };
  }): boolean => {
    const configState = ConfigSelector.state(appState);
    return configState?.configLoaded && configState?.endpointsLoadState === FetchStatus.SUCCESS;
  };

  export const storeInitialized = (appState: {
    csaa_app: { csaa_config: ConfigStateModel };
  }): boolean => {
    const configState = ConfigSelector.state(appState);
    return configState?.storeInitialized;
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthSelector {
  export const state = (appState: { csaa_app: { csaa_auth: AuthStateModel } }) =>
    appState[CSAA_APP_STATE_TOKEN][CSAA_AUTH_STATE_TOKEN];
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CustomerSelector {
  export const state = (appState: { csaa_app: { csaa_customer: CustomerStateModel } }) =>
    appState[CSAA_APP_STATE_TOKEN][CUSTOMER_STATE_TOKEN];
}
