import { TestBed } from '@angular/core/testing';

import { RollbarReporterService } from './rollbar-reporter.service';
import { AnalyticsService, ConfigService, RouterService, StorageService } from '..';
import {
  AnalyticsMockService,
  ConfigMockService,
  StorageMockService,
  StoreTestBuilder,
} from '@app/testing';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { reportError } from '../../helpers';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { ConfigAction } from '../../store/actions';
import { UniHttpErrorResponse } from '../http/uni-http.model';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';

jest.mock('rollbar', () => jest.fn());

describe('RollbarReporterService', () => {
  let service: RollbarReporterService;
  const consoleLog = global.console.log;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CsaaCoreModule],
      providers: [
        { provide: ConfigService, useClass: ConfigMockService },
        { provide: StorageService, useClass: StorageMockService },
        { provide: AnalyticsService, useClass: AnalyticsMockService },
        { provide: RouterService, useClass: RouterMockService },
      ],
    });
    CsaaAppInjector.injector = TestBed.inject(Injector);
    const store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    store.dispatch(new ConfigAction.CompleteRollbarSetup());
    service = TestBed.inject(RollbarReporterService);
    global.console.log = jest.fn();
  });
  afterEach(() => {
    global.console.log = consoleLog;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report non-http errors', () => {
    service.report = jest.fn();
    const error = 'Unknown Error';
    reportError(error);
    expect(service.report).toHaveBeenCalledWith(`(no message)
- Stack: (no stack)
- Error Object: \"Unknown Error\"`);
  });

  it('should report http errors with statusCode from 500 up', () => {
    service.report = jest.fn();
    let error = new UniHttpErrorResponse({
      status: 500,
      statusText: 'Custom Error',
      url: '/api/v1/',
    });
    reportError(error);
    expect(service.report).toHaveBeenCalledWith(
      expect.stringContaining('UniHttpErrorResponse 500')
    );
    error = new UniHttpErrorResponse({ status: 503, statusText: 'Custom Error', url: '/api/v1/' });
    reportError(error);
    expect(service.report).toHaveBeenCalledWith(
      expect.stringContaining('UniHttpErrorResponse 503')
    );
  });

  it('should not report http errors with statusCode below 500', () => {
    service.report = jest.fn();
    let error = new UniHttpErrorResponse({
      status: 404,
      statusText: 'Custom Error',
      url: '/api/v1/',
    });
    reportError(error);
    error = new UniHttpErrorResponse({ status: 401, statusText: 'Custom Error', url: '/api/v1/' });
    reportError(error);
    expect(service.report).not.toHaveBeenCalled();
  });

  describe('Failed transformation', () => {
    it('should handle errors that contains cyclic structure gracefully', () => {
      service.report = jest.fn();
      const error = { message: 'dummy message', inner: [1, 2, 3] };
      error.inner.push(error as any);
      reportError(error);
      expect(service.report).toHaveBeenCalledWith(
        expect.stringContaining(`dummy message
- Stack: (no stack)
- Error Object: unable to stringify error object due to Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'inner' -> object with constructor 'Array'
    --- index 3 closes the circle`)
      );
    });

    it('should handle null/undefined errors gracefully', () => {
      service.report = jest.fn();
      reportError(undefined);
      expect(service.report).toHaveBeenCalledWith(
        expect.stringContaining('TypeError: Cannot read property')
      );
    });
  });
});
