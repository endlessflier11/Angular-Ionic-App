import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { noop, Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../store/states/config.state';
import { interactWithLoader, onceTruthy } from '../../operators';
import { ConfigAction } from '../../store/actions';
import { first, switchMap } from 'rxjs/operators';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { ACA_UNINSURED_REDIRECT_URL } from '../../../constants';
import { WebviewService } from '../../../_core/services';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class BootstrapGuard implements CanActivate {
  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly webviewService: WebviewService
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.ensureReadiness().pipe(first());
  }

  private ensureReadiness(): Observable<boolean | UrlTree> {
    const isReady = (): boolean => this.store.selectSnapshot(ConfigState.configAndEndpointsLoaded);
    const isFetching = (): boolean => this.store.selectSnapshot(ConfigState.endpointsLoading);

    // Case 1: When fetch status === Success
    if (isReady()) {
      return of(true);
    }

    // If we got here, then fetch status is either NOT FETCHED, FETCHING OR ERROR.
    // Case 2: When [fetch status === Error | Not fetched], setup loader and dispatch the fetch process
    if (!isFetching()) {
      this.store.dispatch(new ConfigAction.LoadAppEndpoints());
    }

    return this.store.select(ConfigState.endpointsLoading).pipe(
      onceTruthy((n) => !n),
      switchMap(() => {
        if (isReady()) {
          return of(true);
        }
        return this.redirectToNonInsuredPath();
      }),
      interactWithLoader()
    );
  }

  private redirectToNonInsuredPath() {
    console.log(
      '[CSAA:Bootstrap] AppEndpoints not available. Redirecting user to non insured path.'
    );
    const { nonInsuredRedirectTo, nonInsuredRedirectToExternal, homeBackButtonRedirectTo } =
      this.store.selectSnapshot(ConfigState);

    if (!nonInsuredRedirectTo) {
      // Redirect user to MyPolicy web
      this.webviewService
        .open(
          nonInsuredRedirectToExternal || ACA_UNINSURED_REDIRECT_URL,
          homeBackButtonRedirectTo || '/'
        )
        .then(noop);
    }
    return of(this.router.createUrlTree([nonInsuredRedirectTo || homeBackButtonRedirectTo || '/']));
  }
}
