export const ROOT_NAME__INDEX = 'csaa.home';
export const CSAA_APP_ID = 'mwg-csaa';
export const CSAA_NAVBAR_COLOR = '#ff6666';
export const SERVICE_NUMBER = '888-340-1817';
export const CLAIMS_NUMBER = '800-207-3618';
export const CLAIMS_EMAIL = 'claimdocs@csaa.com';
export const EMERGENCY_NUMBER = '911';
export const ACA_CLUBCODE = '212';

export const ZIP_LENGTH = 5;
export const PIN_ATTEMPTS_ALLOWED = 3;

export const PRIVACY_POLICY_URL =
  'https://csaa-insurance.aaa.com/content/aaa-ie/b2c/en/misc/mobile/privacy-notice.html';
export const TERMS_AND_CONDITIONS_URL =
  'https://csaa-insurance.aaa.com/content/aaa-ie/b2c/en/misc/mobile/terms-of-use.html';

/* Replaced in favour of [WebDeeplinkLocation] */
// export const MY_POLICY_URL = 'https://mypolicyclub.digital.csaa-insurance.aaa.com/dashboard';
// export const AUTOPAY_URL = 'https://mypolicyclub.digital.csaa-insurance.aaa.com/transactions';
// export const CLAIMS_URL = 'https://mypolicyclub.digital.csaa-insurance.aaa.com/claims';
export const GET_A_QUOTE_URL =
  'https://quote.digital.csaa-insurance.aaa.com/?app=yes&appid=IOSMOBILE&source=club';
export const ACCOUNT_SETTINGS_URL =
  'https://mypolicyclub.digital.csaa-insurance.aaa.com/accountSettings';
export const EDIT_POLICY_PREFERENCE_URL =
  'https://mypolicyclub.digital.csaa-insurance.aaa.com/accountSettings/policy/{policyNumber}/preferences';
export const GET_A_BUNDLE_QUOTE_URL =
  'https://quote.csaa-insurance.aaa.com/?source=club&clubcode=005&state={state}&value=MobileMyPolicy';

export const PAYMENTS_SERVICE_NUMBER = '888-340-1817';
export const ACA_UNINSURED_REDIRECT_URL = 'https://www.aaa.com/appsmartphoneinsurance9';

export const CONNECTION_ERRORS = [
  '-1001', // iOS: kCFURLErrorTimedOut
  '-1003', // iOS: kCFURLErrorCannotFindHost
  '-1004', // iOS: kCFURLErrorCannotConnectToHost
  '-1005', // iOS: kCFURLErrorNetworkConnectionLost
  '-1009', // iOS: The Internet connection appears to be offline.
  // Android errors: https://developer.android.com/reference/android/webkit/WebViewClient
  '-2', // Android: ERROR_HOST_LOOKUP
  '-3', // Android: ERROR_UNSUPPORTED_AUTH_SCHEME – shows in Airplane mode
  '-5', // Android: ERROR_PROXY_AUTHENTICATION
  '-6', // Android: ERROR_CONNECT
  '-7', // Android: ERROR_IO
  '-8', // Android: ERROR_TIMEOUT
];

export const HTTP_TRANSLATOR_SERVICE_TIMEOUT = 30000;
