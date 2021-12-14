import { CLAIMS_NUMBER, SERVICE_NUMBER } from '../../../app/micro-apps/csaa-mobile/constants';
import { CONTACT_INFO_RESPONSE } from '../contact-info-mock.fixtures';
import { DEFAULT_RISK_STATE_KEY } from '../../../app/micro-apps/csaa-mobile/_core/store/states/contact-info.state';

const statesContactData = [];
statesContactData[DEFAULT_RISK_STATE_KEY] = {
  claims: CLAIMS_NUMBER,
  claimsHoursOfOperation: [...CONTACT_INFO_RESPONSE.claimsHoursOfOperation],
  customerService: SERVICE_NUMBER,
  customerServiceHoursOfOperation: [...CONTACT_INFO_RESPONSE.customerServiceHoursOfOperation],
  eService: SERVICE_NUMBER,
  emergencyNumber: CLAIMS_NUMBER,
};

export const CONTACT_INFO_STATE_FIXTURE_MOCK = {
  statesContactData,
};
