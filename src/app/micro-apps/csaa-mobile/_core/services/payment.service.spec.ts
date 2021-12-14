import {
  AuthMockService,
  AUTOPAY_ENROLLMENT_ERROR,
  ConfigMockService,
  generatePolicy,
  HttpMockService,
} from '../../../../../testing';
import { GlobalStateMockService } from '../../../../../testing/services/global-state-mock.service';
import { ErrorWithReporter } from '../helpers';
import { PaymentService } from './payment.service';
import { Policy } from '../interfaces';
import { of } from 'rxjs/internal/observable/of';
import { CsaaAppInjector } from '../../csaa-app.injector';

describe('Payment Service', () => {
  let service: PaymentService;
  let store;
  let httpService;
  let policy: Policy;
  beforeEach(() => {
    store = { dispatch: jest.fn(), selectSnapshot: jest.fn() };
    httpService = new HttpMockService();
    service = new PaymentService(
      store,
      httpService,
      new AuthMockService(store, httpService) as any,
      new GlobalStateMockService() as any,
      new ConfigMockService() as any
    );
    CsaaAppInjector.injector = { get: jest.fn().mockReturnValue({}) };

    policy = generatePolicy({
      vehicles: [
        {
          id: 'WAUKJAFM8AA061319',
          name: 'Lamborghini Gallardo',
          coverages: [],
          riskFactors: { waivedLiability: true },
        },
        {
          id: 'WMWZC3C51EWP29276',
          name: 'Aston Martin DB9',
          coverages: [],
          riskFactors: { waivedLiability: false },
        },
      ],
    });
  });
  describe('Account Restricted error', () => {
    it('should detect Account Restricted from Backend error response', () => {
      const errAccRestricted = new ErrorWithReporter(AUTOPAY_ENROLLMENT_ERROR.ACCOUNT_RESTRICTED);
      expect(PaymentService.isAccountRestricted(errAccRestricted)).toBe(true);
    });

    it('should not detect Account Restricted for other error responses', () => {
      expect(PaymentService.isAccountRestricted(null)).toBe(false);
      const errOther = new ErrorWithReporter(AUTOPAY_ENROLLMENT_ERROR.POLICY_NOT_ELIGIBLE);
      expect(PaymentService.isAccountRestricted(errOther)).toBe(false);
      const errStrange = new ErrorWithReporter(null);
      expect(PaymentService.isAccountRestricted(errStrange)).toBe(false);
    });

    it('should not fail if got null response body', (done) => {
      httpService.postNamedResource = jest.fn().mockReturnValue(of({}));
      service.fetchBillingSummary([policy]).subscribe(
        () => done(),
        (error) => {
          fail(error);
          done();
        }
      );
    });
  });
});
