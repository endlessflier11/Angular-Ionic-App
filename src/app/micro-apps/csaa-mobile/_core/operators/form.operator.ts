import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

export const controlFormInteraction = <T = any>(control: AbstractControl) => (
  source: Observable<any>
): Observable<T> => {
  if (!control) {
    return source;
  }

  return new Observable<T>((observer) => {
    control.disable();
    return source.subscribe(
      (v) => {
        control.enable();
        observer.next(v);
      },
      (err) => {
        control.enable();
        observer.error(err);
      },
      () => {
        // The enable method forces the control status to recalculate,
        // so invoking it in a completed callback means we will reset
        // errors set during catchError which is not a desired behavior.
        // Therefore, we'll only do this on rare occasions
        if (!control.enabled) {
          control.enable();
        }
        observer.complete();
      }
    );
  });
};
