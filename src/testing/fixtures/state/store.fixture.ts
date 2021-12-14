/* eslint-disable @typescript-eslint/naming-convention */
import { AUTH_STATE_INITIAL_NOT_LOGGED_FIXTURE_MOCK } from './auth-state.fixture';
import { CONFIG_STATE_INITIAL_FIXTURE_MOCK } from './config-state.fixture';
import { CUSTOMER_STATE_INITIAL_FIXTURE_MOCK } from './customer-state.fixture';
import { getInitialMetadataState } from '../../../app/micro-apps/csaa-mobile/_core/store/states/metadata.state';
import { getInitialContactInfoState } from '../../../app/micro-apps/csaa-mobile/_core/store/states/contact-info.state';

export const STORE_INITIAL_STATE = {
  csaa_customer: CUSTOMER_STATE_INITIAL_FIXTURE_MOCK,
  csaa_fetch: {
    status: {},
    lastError: {},
  },
  csaa_auth: AUTH_STATE_INITIAL_NOT_LOGGED_FIXTURE_MOCK,
  csaa_contactInfo: { ...getInitialContactInfoState() },
  csaa_metadata: { ...getInitialMetadataState() },
  csaa_config: CONFIG_STATE_INITIAL_FIXTURE_MOCK,
};
