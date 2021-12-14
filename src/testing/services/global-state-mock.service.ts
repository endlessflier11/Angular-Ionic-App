export class GlobalStateMockService {
  getIsStandalone = jest.fn().mockReturnValue(true);
  getEvalueEnrolled = jest.fn().mockReturnValue(false);
  setRegistrationId = jest.fn();
  setWalletId = jest.fn().mockReturnValue(true);
  getPaymentsTesting = jest.fn().mockReturnValue(false);
}
