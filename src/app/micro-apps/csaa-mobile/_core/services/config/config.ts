import { CsaaConfig, CsaaConfigEnv, CsaaSharedEnvConfig, CsaaTheme } from '../../interfaces';
const app = require('../../../assets/config/app-info');

const sharedConfig: CsaaSharedEnvConfig = {
  codeVersion: app.version,
  theme: CsaaTheme.DEFAULT,
  rollbarDebugBuildNumber: app.rollbarDebugBuildNumber,
};

export const prodEnvironment: CsaaConfig = {
  ...sharedConfig,
  env: CsaaConfigEnv.PROD,
  segmentToken: 'aoYEVTYLd2L5EwGRTFbo2nfFDwUBST3a',
  serviceLocatorUrl:
    'https://www.mobile-mypolicy.digital.p01.csaa-insurance.aaa.com/servicelocator/v2',
  rollbarEnv: CsaaConfigEnv.PROD,
  rollbarAccessToken: '1c5e215780aa40c28a9d1dc64bf659a5', // In many cases, token will be same for all environments
  apiKey: 'BeAhU2zlmo1lENY6d3rjB3IvdzhaNRDk4OtNalSG',
  walletPassId: 'pass.csaa.digital.mypolicy.poi',
};

export const qaEnvironment: CsaaConfig = {
  ...sharedConfig,
  env: CsaaConfigEnv.QA,
  segmentToken: 'bWl5qrLeu7y0kIIkIqmDY9bTWwleQVzp',
  serviceLocatorUrl:
    'https://www-qa.mobile-mypolicy.digital.n01.csaa-insurance.aaa.com/servicelocator/v2',
  rollbarEnv: CsaaConfigEnv.QA,
  rollbarAccessToken: '1c5e215780aa40c28a9d1dc64bf659a5', // In many cases, token will be same for all environments
  apiKey: 'BeAhU2zlmo1lENY6d3rjB3IvdzhaNRDk4OtNalSG',
  walletPassId: 'pass.csaa.digital.mypolicy.poitest',
};

export const devEnvironment: CsaaConfig = {
  ...sharedConfig,
  env: CsaaConfigEnv.DEV,
  segmentToken: 'bWl5qrLeu7y0kIIkIqmDY9bTWwleQVzp',
  serviceLocatorUrl:
    'https://www-dev.mobile-mypolicy.digital.n01.csaa-insurance.aaa.com/servicelocator/v2',
  rollbarEnv: CsaaConfigEnv.QA,
  rollbarAccessToken: '1c5e215780aa40c28a9d1dc64bf659a5', // In many cases, token will be same for all environments
  apiKey: 'BeAhU2zlmo1lENY6d3rjB3IvdzhaNRDk4OtNalSG',
  walletPassId: 'pass.csaa.digital.mypolicy.poitest',
};

export const perfEnvironment: CsaaConfig = {
  ...sharedConfig,
  env: CsaaConfigEnv.PERF,
  segmentToken: 'bWl5qrLeu7y0kIIkIqmDY9bTWwleQVzp',
  serviceLocatorUrl:
    'https://www-qa.mobile-mypolicy.digital.n01.csaa-insurance.aaa.com/servicelocator/v2',
  rollbarEnv: CsaaConfigEnv.QA,
  rollbarAccessToken: '1c5e215780aa40c28a9d1dc64bf659a5', // In many cases, token will be same for all environments
  apiKey: 'BeAhU2zlmo1lENY6d3rjB3IvdzhaNRDk4OtNalSG',
  walletPassId: 'pass.csaa.digital.mypolicy.poitest',
};

export const bfixEnvironment: CsaaConfig = {
  ...sharedConfig,
  env: CsaaConfigEnv.BFIX,
  segmentToken: 'bWl5qrLeu7y0kIIkIqmDY9bTWwleQVzp',
  serviceLocatorUrl:
    'https://www-qa.mobile-mypolicy.digital.n01.csaa-insurance.aaa.com/servicelocator/v2',
  rollbarEnv: CsaaConfigEnv.QA,
  rollbarAccessToken: '1c5e215780aa40c28a9d1dc64bf659a5', // In many cases, token will be same for all environments
  apiKey: 'BeAhU2zlmo1lENY6d3rjB3IvdzhaNRDk4OtNalSG',
  walletPassId: 'pass.csaa.digital.mypolicy.poitest',
};
