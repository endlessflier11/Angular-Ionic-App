export enum Category {
  landing,
  application,
  claims,
  coverages,
  documents,
  global,
  payments,
  registration,
  error,
  debug,
}

export enum EventName {
  INSURANCE_TAB_TAPPED = 'Insurance Tab Tapped',
  LANDING_PAGE_MAKE_A_PAYMENT_SELECTED = 'Landing Page Make a Payment Selected',
  LANDING_PAGE_MANAGE_MY_POLICY_SELECTED = 'Landing Page Manage My Policy Selected',
  LANDING_PAGE_CALL_FOR_QUOTE_SELECTED = 'Landing Page Call For Quote Selected',
  LANDING_PAGE_START_A_CLAIM_SELECTED = 'Landing Page Start A Claim Selected',
  LANDING_PAGE_WEB_QUOTE_SELECTED = 'Landing Page Web Quote Selected',
  I_HAD_AN_ACCIDENT_SELECTED = 'I Had An Accident Selected',
  GET_A_QUOTE_SELECTED = 'Get a Quote Selected',
  VIEW_DECLARATIONS = 'View Declarations',
  CAMERA_ACCESSED = 'Camera Accessed',
  CALL_911 = 'Call 911',
  CONTACT_CLAIMS = 'Contact Claims',
  CONTACT_INITIATED = 'Contact Initiated',
  OPEN_CLAIMS_VIEWED = 'Open Claims Viewed',
  CARD_EXPANDED = 'Card Expanded',
  WHAT_DO_I_DO_SELECTED = 'What Do I Do Selected',
  I_HAD_AN_INCIDENT_SELECTED = 'I had an incident selected',
  CLAIM_SELECTED = 'Claim Selected',
  COVERAGES_VIEWED = 'Coverages Viewed',
  INDENTED_COVERAGES_VIEWED = 'Indented Coverages viewed',
  COVERAGE_SELECTED = 'Coverage Selected',
  AGENT_CONTACTED = 'Agent contacted',
  VEHICLE_COVERAGE_SELECTED = 'Vehicle Coverage Selected',
  DRIVER_COVERAGE_SELECTED = 'Driver Coverage Selected',
  GENERAL_COVERAGE_SELECTED = 'General Coverage Selected',
  PROOF_OF_INSURANCE_VIEWED = 'Proof of Insurance Viewed',
  AUTO_ID_CARDS_ACCESSED = 'Auto ID Cards Accessed',
  VEHICLE_ID_CARD_EXPANDED = 'Vehicle ID Card Expanded',
  CALL_SUPPORT = 'Call support',
  HOME_ACCESSED = 'Home Accessed',
  PAYMENTS_ACCESSED = 'Payments Accessed',
  PAYMENT_METHOD_ADDED = 'Payment Method Added',
  PAYMENT_METHOD_UPDATED = 'Payment Method Updated',
  PAYMENT_AMOUNT_CANCELLED = 'Payment Amount Cancelled',
  TERMS_AND_CONDITIONS_CLICKED = 'Terms and Conditions Clicked',
  TERMS_AND_CONDITIONS_ANSWERED = 'Terms and Conditions Answered',
  PAYMENT_CONFIRMED = 'Payment Confirmed',
  PAYMENT_SUCCESSFUL_DETAILS = 'Payment Successful Details',
  PAYMENT_AMOUNT_CONFIRMED = 'Payment Amount Confirmed',
  PAYMENT_PAST_DUE_NOTICE = 'Payment Past Due Notice',
  PAYMENT_HISTORY_ACCESSED = 'Payment History Accessed',
  PAYMENT_FAILED = 'Payment Failed',
  MAKE_A_PAYMENT_SELECTED = 'Make a Payment Selected',
  PAY_ALL_SELECTED = 'Pay All Selected',
  SIGN_UP_SELECTED = 'Sign up selected',
  AUTO_POLICY_SELECTED = 'Auto policy selected',
  HOME_POLICY_SELECTED = 'Home policy selected',
  PROPERTY_POLICY_SELECTED = 'Property policy selected',
  VERIFICATION_INITIATED = 'Verification initiated',
  VERIFICATION_REQUESTED = 'Verification requested',
  VERIFICATION_SENT = 'Verification sent',
  VERIFICATION_RECEIVED = 'Verification received',
  VERIFICATION_FAILED = 'Verification failed',
  VERIFICATION_SUCCEEDED = 'Verification succeeded',
  CALL_SERVICE_ERROR_MESSAGE = 'Call Service Error Message',
  NEW_CODE_INITIATED = 'New code initiated',
  PIN_CREATED = 'Pin created',
  SIGN_OUT_SELECTED = 'Sign out selected',
  USER_SIGNED_OUT = 'User signed out',
  SIGN_OUT_CANCELED = 'Sign out canceled',
  FILE_A_CLAIM_SELECTED = 'File a Claim Selected',
  MANAGE_AUTOPAY_VIEWED = 'Manage AutoPay Viewed',
  AUTOPAY_SET = 'AutoPay Set',
  AUTOPAY_ENROLLMENT_STOPPED = 'AutoPay Enrollment Stopped',
  MYPOLICY_LINK_ACCESSED = 'MyPolicy Link Accessed',
  DOCUMENTS_ACCESSED = 'Documents Accessed',
  DOCUMENT_SELECTED = 'Document Selected',
  DOCUMENT_VIEWED = 'Document Viewed',
  DOCUMENT_SAVED = 'Document Saved',
  API_ERROR = 'Api Error',
  DEBUG = 'Debug',
  ERROR_NOTIFICATION = 'Error Notification',
  WARNING_DISPLAYED = 'Warning Displayed',
  WARNING_RESPONSE_RECEIVED = 'Warning Response Received',
  PAPERLESS_TERMS_AND_CONDITIONS_REVIEWED = 'Paperless Terms and Conditions Reviewed',
  PAPERLESS_TERMS_AND_CONDITIONS_ACCEPTED = 'Paperless Terms and Conditions Accepted',
  PAPERLESS_SCREEN_VIEWED = 'Paperless Screen Viewed',
  PAPERLESS_ENROLLMENT_SELECTED = 'Paperless Enrollment Selected',
  EDIT_PAPERLESS_SELECTED = 'Edit Paperless Selected',
  PAPERLESS_CARD_EXPANDED = 'Paperless Card Expanded',
  AUTOPAY_INSTALLMENT_TABLE_EXPANDED = 'AutoPay Installment Table Expanded',
  SAVE_WITH_AUTOPAY_SELECTED = 'Save With AutoPay Selected',
  REVIEW_TERMS_AND_CONDITIONS_SELECTED = 'Review Terms & Conditions Selected',
  ADD_TO_APPLE_WALLET_SELECTED = 'Add to Apple Wallet Selected',
}

export enum EventType {
  OPTION_SELECTED = 'Option Selected',
  LINK_ACCESSED = 'Link Accessed',
  FILE_DOWNLOADED = 'File Downloaded',
  MESSAGED = 'Messaged',
  AUTOMATED_SYSTEM_PROCESS = 'Automated System Process',
  USER_INFORMATION_ENTERED = 'User Information Entered',
  UX_MODIFIED = 'UX Modified',
}

export interface Event {
  category: Category;
  event: EventName;
  // eslint-disable-next-line @typescript-eslint/ban-types
  properties?: object;
}

export enum Screens {
  'Sign Up',
  'Verification',
  'Passcode Creation',
  'Passcode Reset',
  'Passcode Re-Entry',
  'Verification Code',
  // 'PIN Creation', // No such screen - passcode is the right term
  // 'PIN Re-Entry',
  'Bio-Auth Setup',
  'Login',
  'Security',
  'Account Information',
  'Payments',
  'Select an Amount',
  'Add Payment Method',
  'Payment Method',
  'Payment Method Detail',
  'Settings',
  'Policy Page',
  'Various',
  'Re-Register',
  'Home',
  'Payment History',
  'Select Autopay',
  'Autopay Method',
  'Autopay Method Detail',
  'Claims',
  'Policy Document',
  'Policy Summary',
  'Legal',
  'Edit Email',
  'Edit Phone',
  'Email Updated',
  'Phone Updated',
}