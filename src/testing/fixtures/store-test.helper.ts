import { Store } from '@ngxs/store';
import { AUTH_STATE_FIXTURE_MOCK } from './state/auth-state.fixture';
import { USER1_STATE_FIXTURES_MOCK } from './state/by-user-state.fixture';
import { CONFIG_STATE_FIXTURE_MOCK } from './state/config-state.fixture';
import { CONTACT_INFO_STATE_FIXTURE_MOCK } from './state/contact-info-state.fixture';
import { CUSTOMER_STATE_FIXTURE_MOCK } from './state/customer-state.fixture';
import { FETCH_STATE_FIXTURE_MOCK } from './state/fetch-state.fixture';
import { STORE_INITIAL_STATE } from './state/store.fixture';

const STATE_KEY__APP = 'csaa_app';
const STATE_KEY__CONFIG = 'csaa_config';
const STATE_KEY__AUTH = 'csaa_auth';
const STATE_KEY__FETCH = 'csaa_fetch';
const STATE_KEY__CONTACT_INFO = 'csaa_contactInfo';
const STATE_KEY__CUSTOMER = 'csaa_customer';
const STATE_KEY__CUSTOMER_PAYMENT = 'csaa_payment';
const STATE_KEY__CUSTOMER_POLICIES = 'csaa_policies';
const STATE_KEY__METADATA = 'csaa_metadata';

const { METADATA } = USER1_STATE_FIXTURES_MOCK;

export const setCustomerPolicies = (customer, policies) => {
  const CUSTOMER_POLICY = customer.data.policies[0];
  customer.data.policies = policies.map(({ policyNumber }) => ({
    ...CUSTOMER_POLICY,
    policyNumber,
  }));
  return customer;
};

export const setPolicyDocuments = (customer, policyDocuments, policyNumber) => {
  customer.csaa_policies.documents[policyNumber] = policyDocuments;
  return customer;
};

export class StoreTestBuilder {
  private state;
  constructor() {
    this.state = STORE_INITIAL_STATE;
  }

  static withInitialState() {
    return new StoreTestBuilder();
  }

  static withDefaultMocks() {
    return new StoreTestBuilder().withDefaultMocks();
  }

  static withConfigState(config) {
    return new StoreTestBuilder().withConfigState(config);
  }

  withDefaultMocks() {
    this.state = {
      ...STORE_INITIAL_STATE,
      [STATE_KEY__AUTH]: AUTH_STATE_FIXTURE_MOCK,
      [STATE_KEY__CUSTOMER]: CUSTOMER_STATE_FIXTURE_MOCK,
      [STATE_KEY__FETCH]: FETCH_STATE_FIXTURE_MOCK,
      [STATE_KEY__CONTACT_INFO]: CONTACT_INFO_STATE_FIXTURE_MOCK,
      [STATE_KEY__METADATA]: METADATA,
      [STATE_KEY__CONFIG]: CONFIG_STATE_FIXTURE_MOCK,
    };
    return this;
  }

  withConfigState(config) {
    this.state[STATE_KEY__CONFIG] = config;
    return this;
  }

  withCustomerState(data) {
    this.state[STATE_KEY__CUSTOMER] = data;
    return this;
  }

  patchCustomerData(data) {
    this.state[STATE_KEY__CUSTOMER].data = { ...this.state[STATE_KEY__CUSTOMER].data, ...data };
    return this;
  }

  patchCustomerPaymentDataAtIndex(idx: number, patch: { [k: string]: any }) {
    const payment = this.state[STATE_KEY__CUSTOMER][STATE_KEY__CUSTOMER_PAYMENT].payments[idx];
    if (payment) {
      this.state[STATE_KEY__CUSTOMER][STATE_KEY__CUSTOMER_PAYMENT].payments[idx] = {
        ...payment,
        ...patch,
      };
    }
    return this;
  }

  patchPolicy(policyNumber: string, patch: { [k: string]: any }) {
    const policy = this.state[STATE_KEY__CUSTOMER][STATE_KEY__CUSTOMER_POLICIES]?.policies.find(
      (p) => p.number === policyNumber
    );
    if (policy) {
      Object.assign(policy, patch);
    }
    return this;
  }

  withPolicyState(data: any) {
    this.state[STATE_KEY__CUSTOMER].csaa_policies = data;
    return this;
  }

  withPaymentState(data: any) {
    this.state[STATE_KEY__CUSTOMER][STATE_KEY__CUSTOMER_PAYMENT] = data;
    return this;
  }

  resetStateOf(store: Store) {
    const newState = this.getState();
    const state = store.snapshot();
    store.reset({
      ...state,
      [STATE_KEY__APP]: {
        ...state[STATE_KEY__APP],
        ...newState,
      },
    });
    return this;
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }
}
