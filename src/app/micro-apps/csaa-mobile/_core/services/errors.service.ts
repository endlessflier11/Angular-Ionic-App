import { Injectable } from '@angular/core';
import { getActionTypeFromInstance } from '@ngxs/store';
import { Subject } from 'rxjs';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class ErrorService {
  errorSubject$: Subject<string>;
  private lastErrorObject: {
    [key: string]: any;
  } = {};

  constructor() {
    this.errorSubject$ = new Subject();
  }

  publishError(errorType: string) {
    this.errorSubject$.next(errorType);
  }

  getErrors() {
    return this.errorSubject$;
  }

  registerErrorFor(action: any, error: any) {
    try {
      const actionKey = getActionTypeFromInstance(action);
      if (!!actionKey) {
        this.lastErrorObject[actionKey] = error;
      }
    } catch (e) {
      console.log('[CSAA:ErrorService] Not able to register error ', { action, error, cause: e });
    }
  }

  getLastErrorFor(action: any) {
    let error = null;
    try {
      const actionKey = getActionTypeFromInstance(action);
      if (!!actionKey) {
        error = this.lastErrorObject[actionKey];
      }
    } catch (e) {
      console.log('[CSAA:ErrorService] Not able to get error ', { action, cause: e });
    }
    return error;
  }
}
