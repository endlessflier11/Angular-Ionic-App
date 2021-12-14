import { Observable } from 'rxjs';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { getActionTypeFromInstance, Store } from '@ngxs/store';
import { FetchAction } from '../store/actions';
import { getErrorReason } from '../helpers/misc.helpers';
import { ErrorService } from '../services/errors.service';

export const trackRequest = <T = any>(action: any) => (source: Observable<T>): Observable<T> => {
  if (!(source instanceof Observable)) {
    return source;
  }
  const actionType = getActionTypeFromInstance(action);
  let store;
  const dispatch = (statusAction) => {
    try {
      if (!store) {
        store = CsaaAppInjector.get(Store);
      }
      store.dispatch(statusAction);
    } catch (error) {
      console.log(
        '[CSAA:trackFetchStatus] not able to inject store. Skipping state',
        getActionTypeFromInstance(statusAction),
        'for action',
        actionType
      );
    }
  };

  dispatch(new FetchAction.Fetching(actionType));
  return new Observable<T>((subscriber) => {
    source.subscribe({
      next: (v) => {
        subscriber.next(v);
        dispatch(new FetchAction.Success(actionType));
      },
      error: (error) => {
        subscriber.error(error);
        // We cant keep unserializable objects in store.
        // 1) Store original error in ErrorService
        try {
          const errorService = CsaaAppInjector.get(ErrorService);
          errorService.registerErrorFor(action, error);
        } catch (e) {
          console.log('[CSAA:trackFetchStatus] not able to register error object for action', {
            actionType,
            error,
          });
        }
        // 2) Update action fetch status with an error message
        dispatch(new FetchAction.Error(actionType, getErrorReason(error)));
      },
      complete: () => {
        subscriber.complete();
      },
    });
  });
};
