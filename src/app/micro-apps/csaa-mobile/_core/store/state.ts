import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';
import { ConfigState } from './states/config.state';
import { MetadataState } from './states/metadata.state';
import { CsaaAuthState } from './states/auth.state';
import { ContactInfoState } from './states/contact-info.state';
import { FetchState } from './states/fetch.state';
import { CUSTOMER_CHILD_STATES, CustomerState } from './states/customer.state';
import { CSAA_APP_STATE_TOKEN } from './states/state.interfaces';
import { UserSettingsState } from './states/user-setting.state';

/*
 * - __csaa_app
 * ├── config
 * ├── user_setting
 * ├── metadata
 * ├── contact // TODO: consume state withing the app
 * ├── fetch
 * ├── auth
 * └── customer
 *     ├── policies
 *     ├── payments
 *     └── claims
 * */
const CHILD_STATES = [
  ConfigState,
  MetadataState,
  ContactInfoState,
  CsaaAuthState,
  FetchState,
  CustomerState,
  UserSettingsState,
];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CsaaAppStateModel {}

@State<CsaaAppStateModel>({
  name: CSAA_APP_STATE_TOKEN,
  children: CHILD_STATES,
})
@Injectable()
export class CsaaAppState {}

export const CSAA_STORES = [CsaaAppState, ...CHILD_STATES, ...CUSTOMER_CHILD_STATES];
