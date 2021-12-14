/* eslint-disable @typescript-eslint/naming-convention */
import { USER1_STATE_FIXTURES_MOCK } from './by-user-state.fixture';

export const CUSTOMER_STATE_INITIAL_FIXTURE_MOCK = {
  data: null,
  csaa_claims: [],
  csaa_payment: {
    payments: [],
    wallet: { paymentAccounts: [] },
    history: {},
    bills: {},
  },
  csaa_policies: {
    policies: [],
    documents: {},
    allowedEndorsements: {},
    activeDocument: null,
  },
};

const { CUSTOMER_POLICIES, POLICIES, CLAIMS, PAYMENTS } = USER1_STATE_FIXTURES_MOCK;
export const CUSTOMER_STATE_FIXTURE_MOCK = {
  data: {
    mdmId: '1584030838880',
    fullName: 'HAITHM ALABDI',
    firstName: 'HAITHM',
    lastName: 'ALABDI',
    customerAddress: {
      addressType: 'mailing',
      address1: '518 25TH ST',
      streetAddressLine: null,
      zipCode: '94804-1637',
      city: 'RICHMOND',
      state: 'CA',
      stateFullName: 'California',
    },
    insuranceAddress: {
      address2: 'PO Box 24511',
      additional: 'NAIC # : 37770',
      siteDomain: null,
      phone: null,
      addressType: null,
      address1: 'CSAA General Insurance Company',
      streetAddressLine: null,
      zipCode: '94623-9865',
      city: 'Oakland',
      state: 'CA',
      stateFullName: 'California',
    },
    registrations: [
      {
        registrationId: '0D5B252F-17F3-40E9-A95F-BC6A0BA80E0A',
        registrationSource: null,
        startDate: null,
      },
    ],
    policies: CUSTOMER_POLICIES,
    hash: null,
    phoneType: 'homephonenumber',
    telephoneNumber: '5103672169',
    emailType: 'EMAIL1',
    email: 'A151@TESTUSER.EXAMPLE.COM',
    smsTnc: false,
  },
  csaa_claims: CLAIMS,
  csaa_payment: PAYMENTS,
  csaa_policies: {
    policies: POLICIES,
    documents: {},
    allowedEndorsements: {},
    activeDocument: null,
  },
};
