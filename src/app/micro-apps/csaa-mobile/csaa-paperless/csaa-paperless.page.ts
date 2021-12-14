import { Component, OnInit } from '@angular/core';
import { ConfigState } from '../_core/store/states/config.state';
import { Select, Store } from '@ngxs/store';
import { AnalyticsService, RouterService, SsoService, WebviewService } from '../_core/services';
import {
  Category,
  EventName,
  EventType,
  Policy,
  PolicyPaperlessPreference,
  WebDeeplinkLocation,
} from '../_core/interfaces';
import { PolicyState } from '../_core/store/states/policy.state';
import { noop, Observable } from 'rxjs';
import { CustomerAction, PolicyAction, UserSettingAction } from '../_core/store/actions';
import { finalize, switchMap } from 'rxjs/operators';
import { withErrorReporter } from '../_core/helpers';
import { IonRefresher } from '@ionic/angular';
import { UserSettingsState } from '../_core/store/states/user-setting.state';
import { interactWithLoader } from '../_core/operators';

@Component({
  selector: 'csaa-paperless',
  templateUrl: './csaa-paperless.page.html',
  styleUrls: ['./csaa-paperless.page.scss'],
})
export class CsaaPaperlessPage implements OnInit {
  currentTheme: string;
  @Select(PolicyState.activePolicies) policies$: Observable<Policy[]>;
  @Select(UserSettingsState.paperlessPreferences) paperlessPreferences$: Observable<
    PolicyPaperlessPreference[]
  >;

  public loading: boolean;
  private refresher: IonRefresher;

  constructor(
    private store: Store,
    private analyticsService: AnalyticsService,
    private routerService: RouterService,
    private readonly webviewService: WebviewService,
    private readonly ssoService: SsoService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  public byPolicyNumber = (pref, policyNumber) => pref.find((p) => p.policyNumber === policyNumber);

  ngOnInit() {
    this.dispatchLoadAction();

    this.analyticsService.trackEvent(EventName.PAPERLESS_SCREEN_VIEWED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
    });
  }

  backButtonClick() {
    this.routerService.back();
  }

  notUsingPaperless(preferences: PolicyPaperlessPreference[]) {
    return !preferences?.reduce(
      (using, pref) => using || pref?.email?.enabled || pref?.email?.isPending,
      false
    );
  }

  goPaperlessHandler() {
    this.analyticsService.trackEvent(EventName.PAPERLESS_ENROLLMENT_SELECTED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
    });
    this.ssoService
      .generateWebDeeplink(WebDeeplinkLocation.ACCOUNT_SETTINGS)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter(async (url) => {
          await this.webviewService.open(url);
          this.dispatchReloadActions();
        })
      );
  }

  dispatchLoadAction() {
    this.loading = true;
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() =>
          this.store.dispatch(new UserSettingAction.ReloadPolicyPaperlessPreferences())
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  dispatchReloadActions() {
    this.loading = true;
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.ReloadPolicies())),
        switchMap(() =>
          this.store.dispatch(new UserSettingAction.ReloadPolicyPaperlessPreferences())
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  doRefresh(event) {
    this.refresher = event.target;
    this.dispatchReloadActions();
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
    }
  }
  reloadOnTermsAccepted(status) {
    if (!!status) {
      this.dispatchReloadActions();
    }
  }
}
