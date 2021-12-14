/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, noop, Observable, of, Subscription } from 'rxjs';
import { AuthService, SsoService } from '../../_core/services';
import { ClubConfigHelper } from '../../_core/helpers/club-config.helper';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../micro-apps/csaa-mobile/_core/store/states/config.state';
import { unsubscribeIfPresent } from '../../micro-apps/csaa-mobile/_core/helpers';
import {
  FetchState,
  FetchStateError,
} from '../../micro-apps/csaa-mobile/_core/store/states/fetch.state';
import { CsaaAuthAction } from '../../micro-apps/csaa-mobile/_core/store/actions';
import { map } from 'rxjs/operators';
import {
  filterFetchErrorsBefore,
  onceTruthy,
  trackIsActive,
} from '../../micro-apps/csaa-mobile/_core/operators';

@Component({
  selector: 'app-csaa-sso-login',
  templateUrl: './sso-login.page.html',
  styleUrls: ['./sso-login.page.scss'],
})
export class SsoLoginPage implements OnInit, OnDestroy {
  public readonly form: FormGroup;
  valueChanges: Subscription;
  disableOnLoading: Subscription;

  error = null;
  @Select(FetchState.activeErrorFor(CsaaAuthAction.RequestIgAccessToken))
  _translatorError$: Observable<FetchStateError>;
  translatorError$: Observable<string>;
  @Select(FetchState.isLoading(CsaaAuthAction.RequestIgAccessToken))
  _isLoading$: Observable<boolean>;
  formSubmitionSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ssoService: SsoService,
    private readonly navController: NavController,
    private readonly authService: AuthService,
    private readonly store: Store
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.translatorError$ = this._translatorError$.pipe(filterFetchErrorsBefore(Date.now()));

    // This is a way to combine the state of two async and inependent actions:
    // SSO Login and CsaaAuthAction.RequestIgAccessToken
    this.isLoading$ = combineLatest([this._isLoading$, this.formSubmitionSubject]).pipe(
      map((areActionsLoading) => areActionsLoading.find(Boolean))
    );
    // so we can properly use the loading state to control form state
    this.disableOnLoading = this.isLoading$.subscribe((loading) => {
      if (loading) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  ngOnDestroy() {
    unsubscribeIfPresent(this.valueChanges);
    unsubscribeIfPresent(this.disableOnLoading);
  }

  submit() {
    this.error = null;
    const inputs = this.form.value;
    if (this.form.invalid) {
      return;
    }

    this.ssoService
      .loginViaSsoBypass(inputs.email)
      .pipe(trackIsActive(this.formSubmitionSubject))
      .subscribe(
        () => {
          this.authService.ready().subscribe(() => {
            if (this.authService.isAuthenticated) {
              this.goToClubHome();
            } else if (
              this.store.selectSnapshot(FetchState.isLoading(CsaaAuthAction.RequestIgAccessToken))
            ) {
              this.isLoading$
                .pipe(
                  map((loading) => !loading),
                  onceTruthy()
                )
                .subscribe(() => {
                  if (
                    this.store.selectSnapshot(
                      FetchState.succeeded(CsaaAuthAction.RequestIgAccessToken)
                    )
                  ) {
                    this.goToClubHome();
                  }
                });
            }
          });
        },
        (error) => {
          console.log('CSAA:', { error });
          this.error = error.message;
          return of(error);
        }
      );
  }

  goToClubHome() {
    const theme = this.store.selectSnapshot(ConfigState.theme);
    const { clubPath } = ClubConfigHelper.getPaths(theme);
    this.navController.navigateForward(clubPath).then(noop);
  }

  goBack() {
    this.navController.back();
  }
}
