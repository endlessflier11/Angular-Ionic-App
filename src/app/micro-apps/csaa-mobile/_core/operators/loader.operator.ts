import { Observable, noop, Subject } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { CsaaAppInjector } from '../../csaa-app.injector';

class LoaderRef {
  private readonly readyPromise: Promise<any>;
  private loader: HTMLIonLoadingElement;
  private readyToken: (value: any) => void;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.readyToken = resolve;
    });
  }

  public setLoader(loader: HTMLIonLoadingElement): this {
    this.loader = loader;
    this.readyToken(void 0);
    return this;
  }

  public present(): this {
    this.loader.present().then(noop);
    return this;
  }

  public dismiss(): void {
    // Sometimes, we get involved in a race condition when trying to dismiss a loader who's ref is not set.
    // This is one way to ensure ref to loader is set before invoking loader.dismiss()
    this.readyPromise.then(() => this.loader.dismiss().then(noop));
  }
}

export const interactWithLoader =
  <T = any>() =>
  (source: Observable<T>): Observable<T> => {
    if (!(source instanceof Observable)) {
      return source;
    }

    const ref = new LoaderRef();
    CsaaAppInjector.get(LoadingController)
      .create()
      .then((loader) => ref.setLoader(loader).present());

    return new Observable<T>((subscriber) => {
      source
        .subscribe({
          next: (v) => subscriber.next(v),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        })
        .add(() => ref.dismiss());
    });
  };

export const trackIsActive =
  <T = any>(subject: Subject<boolean>) =>
  (source: Observable<any>): Observable<T> => {
    if (!subject) {
      return source;
    }

    return new Observable<T>((observer) => {
      subject.next(true);
      return source.subscribe(
        (v) => {
          observer.next(v);
          subject.next(false);
        },
        (err) => {
          observer.error(err);
          subject.next(false);
        },
        () => {
          observer.complete();
          subject.next(false);
        }
      );
    });
  };
