import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { from, noop, Observable, of } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth/auth.service';
import { RouterService, StorageService, WebviewService } from '../services';
import { Store } from '@ngxs/store';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { FetchState } from '../store/states/fetch.state';
import { CsaaAuthAction } from '../store/actions';
import { onceTruthy } from '../operators';
import { CsaaAuthState } from '../store/states/auth.state';
import { LoadingController } from '@ionic/angular';
import { ConfigState } from '../store/states/config.state';
import { ACA_UNINSURED_REDIRECT_URL } from '../../constants';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class CsaaAuthGuard implements CanActivate {
  private activeUser = null;
  private loadingElement = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly routerService: RouterService,
    private readonly storageService: StorageService,
    private readonly store: Store,
    private readonly loadingCtrl: LoadingController,
    private webviewService: WebviewService
  ) {}

  canActivate(
    _: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.routerService.isCsaaModulesRoute(state.url)) {return of(true);}
    this.loadingElement = null;

    return this.storageService.ready().pipe(
      switchMap(() => {
        if (!this.store.selectSnapshot(FetchState.isLoading(CsaaAuthAction.RequestIgAccessToken))) {
          return of(null);
        }

        return from(this.loadingCtrl.create()).pipe(
          tap((instance) => {
            this.loadingElement = instance;
            instance.present();
          })
        );
      }),
      switchMap(() => {
        const {
          nonInsuredRedirectTo,
          nonInsuredRedirectToExternal,
          moduleRootPath,
          homeBackButtonRedirectTo,
        } = this.store.selectSnapshot(ConfigState);

        return this.store.select(ConfigState.configAndEndpointsLoaded).pipe(
          onceTruthy(),
          switchMap(() =>
            this.store.select(FetchState.isLoading(CsaaAuthAction.RequestIgAccessToken))
          ),
          onceTruthy((loading) => !loading),
          switchMap(() => this.authService.isLoggedIn().pipe(
              finalize(() => {
                if (this.loadingElement) {
                  this.loadingElement.dismiss();
                }
              }),
              switchMap((isLoggedIn) => {
                if (!isLoggedIn) {
                  if (!nonInsuredRedirectTo) {
                    // Redirect user to MyPolicy web
                    this.webviewService
                      .open(
                        nonInsuredRedirectToExternal || ACA_UNINSURED_REDIRECT_URL,
                        homeBackButtonRedirectTo || '/'
                      )
                      .then(noop);
                  }
                  return of(
                    this.router.createUrlTree([
                      nonInsuredRedirectTo || homeBackButtonRedirectTo || '/',
                    ])
                  );
                }
                // For MWG tabbed design, to prevent routing deep after a logout/login cycle
                const currentUser = this.store.selectSnapshot(CsaaAuthState.user);
                this.activeUser = this.activeUser || currentUser;
                if (this.activeUser !== currentUser) {
                  this.activeUser = currentUser;
                  // send user to CSAA Home screen
                  return of(this.router.createUrlTree([moduleRootPath || '/']));
                }
                return of(true);
              })
            ))
        );
      })
    );
  }
}
