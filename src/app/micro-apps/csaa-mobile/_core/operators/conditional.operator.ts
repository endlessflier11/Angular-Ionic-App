import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { FetchStateError } from '../store/states/fetch.state';

export const onceTruthy = <T = any>(compareFn?: (n: any) => boolean) => (
  source: Observable<T>
): Observable<T> => {
  if (!(source instanceof Observable)) {
    return source;
  }
  return source.pipe(
    filter((n) =>
      compareFn && typeof compareFn === 'function' ? compareFn.call(compareFn, n) : !!n
    ),
    take(1)
  );
};

export const onceFalsy = <T = any>(compareFn?: (n: any) => boolean) => (
  source: Observable<T>
): Observable<T> => {
  if (!(source instanceof Observable)) {
    return source;
  }
  return source.pipe(
    filter((n) =>
      compareFn && typeof compareFn === 'function' ? compareFn.call(compareFn, n) : !!!n
    ),
    take(1)
  );
};

export const filterFetchErrorsBefore = (now: number) => (
  source: Observable<FetchStateError>
): Observable<string> => {
  if (!(source instanceof Observable)) {
    return source;
  }
  return source.pipe(map((error) => (error?.time > now ? error?.message : '')));
};
