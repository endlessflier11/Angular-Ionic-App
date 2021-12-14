import { Observer } from 'rxjs';

import { CsaaAppInjector } from '../../csaa-app.injector';
import { AnalyticsService } from '../services/analytics.service';
import { Category, EventName, EventType } from '../interfaces';
import { RollbarReporterService } from '../services/rollbar-reporter/rollbar-reporter.service';
import { getErrorReason } from './misc.helpers';
import { UniHttpErrorResponse } from '../services/http/uni-http.model';

export class ErrorWithReporter {
  private analyticsService: AnalyticsService;
  private reporter: RollbarReporterService;

  constructor(private readonly originalError: any) {
    Object.freeze(this.originalError);
  }

  public getOriginalError() {
    return this.originalError;
  }

  public report(): void {
    console.log('CSAA: Error Reporter: ', this.originalError, getErrorReason(this.originalError));
    if (this.originalError instanceof UniHttpErrorResponse && this.originalError.status < 500) {
      return;
    }
    this.sendReport();
  }

  public reportAlways(): void {
    console.log('CSAA: Error Reporter: ', this.originalError, getErrorReason(this.originalError));
    this.sendReport();
  }

  private sendReport(): void {
    this.getReporter().report(getErrorReason(this.originalError));
    this.getAnalyticsService().trackEvent(EventName.ERROR_NOTIFICATION, Category.global, {
      event_type: EventType.MESSAGED,
      reason: getErrorReason(this.originalError),
    });
  }

  private getReporter(): RollbarReporterService {
    if (!this.reporter) {
      this.reporter = CsaaAppInjector.injector.get(RollbarReporterService);
    }
    return this.reporter;
  }

  private getAnalyticsService(): AnalyticsService {
    if (!this.analyticsService) {
      this.analyticsService = CsaaAppInjector.injector.get(AnalyticsService);
    }
    return this.analyticsService;
  }
}

export const tryAndReport = (fn, invoke?: boolean) => {
  const wrapperFn = (...args) => {
    try {
      return fn.call(fn, ...args);
    } catch (e) {
      reportError(e);
    }
  };
  if (invoke) {
    return wrapperFn();
  }
  return wrapperFn;
};

export const reportError = (e: any) => {
  new ErrorWithReporter(e).report();
};

export const forceReportError = (e: any) => {
  new ErrorWithReporter(e).reportAlways();
};

export const withErrorReporter = <T>(
  onSuccess?: (value?: T) => void,
  onError?: (e: ErrorWithReporter) => void,
  onComplete?: () => void
): Observer<T> => ({
  next: tryAndReport((value?: T) => {
    if (onSuccess) {
      onSuccess.call(onSuccess, value);
    }
  }),
  error: tryAndReport((err?: any) => {
    const errorWithReporter = new ErrorWithReporter(err);

    // If subscriber didn't provide onError fn, we'd report immediately
    // Else we'd pass the reporter with the error so they call error.report() manually
    if (!onError) {
      errorWithReporter.report();
    } else {
      onError.call(onError, errorWithReporter);
    }
  }),
  complete: tryAndReport(() => {
    if (onComplete) {
      onComplete.call(onComplete);
    }
  }),
});
