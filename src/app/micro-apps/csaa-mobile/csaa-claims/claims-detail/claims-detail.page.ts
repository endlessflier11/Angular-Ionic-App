import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRefresher, Platform } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { noop, Observable, Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { CLAIMS_EMAIL, CLAIMS_NUMBER } from '../../constants';
import { withErrorReporter } from '../../_core/helpers';
import { fetchHasFailedFor, unsubscribeIfPresent } from '../../_core/helpers/async.helper';
import { EventType, Policy } from '../../_core/interfaces';
import { Category, EventName } from '../../_core/interfaces/analytics.interface';
import { Claim } from '../../_core/interfaces/claim.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { ConfigService } from '../../_core/services/config/config.service';
import { RouterService } from '../../_core/services/router/router.service';
import { SubSink } from '../../_core/shared/subscription.helper';
import { ClaimAction, CustomerAction, PolicyAction } from '../../_core/store/actions';
import { ClaimState } from '../../_core/store/states/claim.state';
import { ContactInfoState } from '../../_core/store/states/contact-info.state';
import { PolicyState } from '../../_core/store/states/policy.state';

@Component({
  selector: 'csaa-claims-detail',
  templateUrl: './claims-detail.page.html',
  styleUrls: ['./claims-detail.page.scss'],
})
export class ClaimsDetailPage implements OnInit, OnDestroy {
  subsink = new SubSink();
  currentTheme: string;
  claimNumber: string;
  claim$: Observable<Claim>;
  policy: Policy;

  emailSubjectText = '';
  claimsRepresentativeName = '';
  claimsEmailAddress: string = CLAIMS_EMAIL;
  claimsPhoneNumber = CLAIMS_NUMBER;

  loading = false;
  private refresher: IonRefresher;
  backButtonSubscription: Subscription;

  constructor(
    private readonly store: Store,
    private readonly callService: CallService,
    private readonly analyticsService: AnalyticsService,
    private readonly platform: Platform,
    private readonly routerService: RouterService,
    private readonly configService: ConfigService,
    private readonly route: ActivatedRoute
  ) {
    this.currentTheme = this.configService.getTheme();
    this.subsink.add(
      fetchHasFailedFor(store, CustomerAction.LoadCustomer, PolicyAction.LoadPolicies).subscribe(
        () => this.routerService.navigateRoot()
      )
    );
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      withErrorReporter((paramMap) => {
        this.claimNumber = paramMap.get('claimNumber');
        this.loadClaimDetails();
      })
    );
  }
  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.backButtonClick()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  backButtonClick() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.back();
  }

  doRefresh(refresher) {
    this.loading = true;
    this.refresher = refresher;
    this.dispatchReloadActions();
  }

  private loadClaimDetails() {
    this.loading = true;
    this.claim$ = this.store.select(ClaimState.claimData(this.claimNumber));
    this.subsink.add(
      this.store.select(ClaimState.claimData(this.claimNumber)).subscribe((claim) => {
        this.claimsRepresentativeName = '';
        this.emailSubjectText = '';
        this.claimsPhoneNumber = CLAIMS_NUMBER;
        this.policy = null;

        if (!!claim) {
          this.policy = this.store.selectSnapshot(PolicyState.policyData(claim.policyNumber));
          this.claimsRepresentativeName = claim.adjuster?.name;
          this.emailSubjectText = `Claim #${claim.number}`;
          this.claimsPhoneNumber =
            claim.adjuster && claim.adjuster.phone
              ? claim.adjuster.phone
              : this.store.selectSnapshot(ContactInfoState.claimsNumber(this.policy.riskState));
        }
      })
    );
    this.dispatchLoadActions();
  }

  callClaims() {
    this.trackContactInitiated('phone');
    this.callService.call(this.claimsPhoneNumber);
  }

  trackContactInitiated(method) {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Contact Claims',
      method: method === 'email' ? 'email' : 'phone',
    });
  }

  private dispatchLoadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() => this.store.dispatch(new ClaimAction.LoadClaims())),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter(noop));
  }
  private dispatchReloadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() => this.store.dispatch(new ClaimAction.ReloadClaims())),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter(noop));
  }
}
