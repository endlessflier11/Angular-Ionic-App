import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { AuthService, RouterService, StorageService } from '../_core/services';
import { combineLatest, from, noop, Observable, of, Subject, zip } from 'rxjs';
import { AlertController, IonRefresher, Platform } from '@ionic/angular';
import { UpcomingPayment } from '../_core/interfaces/payment.interface';
import { Policy, PolicyType } from '../_core/interfaces/policy.interface';
import { Category, EventName, EventType } from '../_core/interfaces/analytics.interface';
import { Claim } from '../_core/interfaces/claim.interface';
import { AnalyticsService } from '../_core/services/analytics.service';
import { GlobalStateService } from '../_core/services/global-state.service';
import { catchError, filter, finalize, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { differenceInDays } from 'date-fns';
import { CustomErrorHandler } from '../_core/shared/custom-error-handler';
import { CallService } from '../_core/services/call.service';
import { fetchIsLoadingFor, withErrorReporter } from '../_core/helpers';
import { STORAGE_KEY } from '../_core/services/storage/storage.keys';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../_core/store/states/config.state';
import { ContactInfoState } from '../_core/store/states/contact-info.state';
import { CsaaAuthState } from '../_core/store/states/auth.state';
import { PolicyState } from '../_core/store/states/policy.state';
import { ClaimState } from '../_core/store/states/claim.state';
import { FetchState } from '../_core/store/states/fetch.state';
import { ClaimAction, CustomerAction, PaymentAction, PolicyAction } from '../_core/store/actions';
import { onceTruthy } from '../_core/operators';
import { SubSink } from '../_core/shared/subscription.helper';
import { PaymentState } from '../_core/store/states/payment.state';
import { CustomerState } from '../_core/store/states/customer.state';
import { MetadataState } from '../_core/store/states/metadata.state';
const ALERT_TIMEOUT_IN_DAYS = 7;

@Component({
  selector: 'app-csaa-home',
  templateUrl: './csaa-home.page.html',
  styleUrls: ['./csaa-home.page.scss'],
})
export class CsaaHomePage implements OnDestroy, OnInit {
  @HostBinding('class.csaa')
  csaaBaseClass = true;

  didAlertThisSession = false;
  @Select(CsaaAuthState.username) username$: Observable<string>;

  // same goes for errors coming back for specific responses so we can handle this on the UI as well
  loading$: Observable<boolean>;
  @Select(PolicyState.activePolicies) policies$: Observable<Policy[]>;
  @Select(PolicyState.gracePeriodPolicies) gracePeriodPolicies$: Observable<Policy[]>;
  @Select(PolicyState.cancelledPolicies) cancelledPolicies$: Observable<Policy[]>;
  @Select(ClaimState) claims$: Observable<Claim[]>;

  // Payment selectors
  @Select(PaymentState.upcomingPayments) upcomingPayments$: Observable<UpcomingPayment[]>;
  @Select(PaymentState.upcomingPaymentsDue) upcomingPaymentsDue$: Observable<UpcomingPayment[]>;

  private readonly subsink = new SubSink();

  loading: boolean;

  isAndroidPlatform: boolean;
  refresher: IonRefresher;
  showSettings = this.globalStateService.getIsStandalone();
  private unsubscribe$ = new Subject();

  currentTheme: string;
  hasAutoPolicy = false;
  hasActivePolicies = false;

  showHeader = false;

  errorMap = {
    claims: false,
    payments: false,
    policies: false,
  };

  constructor(
    private storage: StorageService,
    private errorHandler: CustomErrorHandler,
    private platform: Platform,
    private analyticsService: AnalyticsService,
    private alertCtrl: AlertController,
    private callService: CallService,
    private globalStateService: GlobalStateService,
    private routerService: RouterService,
    private authService: AuthService,
    private store: Store
  ) {
    this.loading$ = fetchIsLoadingFor(
      this.store,
      CustomerAction.LoadCustomer,
      PolicyAction.LoadPolicies,
      PaymentAction.LoadPayments
    );

    this.subsink.add(
      combineLatest([
        this.store.select(FetchState.failed(CustomerAction.LoadCustomer)),
        this.store.select(FetchState.failed(PolicyAction.LoadPolicies)),
        this.store.select(FetchState.failed(PaymentAction.LoadPayments)),
        this.store.select(FetchState.failed(ClaimAction.LoadClaims)),
      ]).subscribe(([customer, policies, payments, claims]) => {
        this.errorMap = {
          policies: policies || customer,
          payments: payments || policies || customer,
          claims: claims || policies || customer,
        };
      })
    );

    this.subsink.add(
      this.loading$.pipe(filter((loading) => !loading)).subscribe(() => {
        this.dismissRefresher();
      })
    );

    this.subsink.add(
      this.gracePeriodPolicies$.subscribe((gracePeriodPolicies) => {
        // Added to debug delay between loading:false and policies being rendered in the page
        this.hasActivePolicies = gracePeriodPolicies.length > 0;
      })
    );

    // Cleanup on logout
    this.subsink.add(
      this.authService.onUserLogout().subscribe(
        withErrorReporter(() => {
          this.didAlertThisSession = false;
          this.hasAutoPolicy = false;
          Object.keys(this.errorMap).forEach((key) => (this.errorMap[key] = false));
          this.dismissRefresher();
        })
      )
    );
  }

  ngOnInit() {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.showHeader = this.store.selectSnapshot(ConfigState).showHomeHeader;
    this.isAndroidPlatform = this.platform.is('android');
    this.identifyNameAndPolicies();
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  updateLastAlertTime() {
    const save = async () => {
      await this.storage.set(STORAGE_KEY.LAST_WARNING_TIME, Date.now().toString());
    };
    return from(save());
  }

  getLastAlertTime() {
    const getWarning = async () => this.storage.get(STORAGE_KEY.LAST_WARNING_TIME);
    return from(getWarning()).pipe(catchError(() => of(null)));
  }

  ionViewWillEnter() {
    this.loadData();
  }

  private identifyNameAndPolicies() {
    this.subsink.add(
      combineLatest([
        this.store.select(FetchState.succeeded(CustomerAction.LoadCustomer)),
        this.store.select(FetchState.succeeded(PolicyAction.LoadPolicies)),
      ])
        .pipe(
          map(([customer, policies]) => customer && policies),
          onceTruthy(),
          switchMap(() => zip(this.policies$, this.username$)),
          take(1)
        )
        .subscribe(
          withErrorReporter(() => {
            const customerData = this.store.selectSnapshot(CustomerState.customerData);
            if (!!customerData) {
              const policies = this.store.selectSnapshot(PolicyState.activePolicies);
              const policyNumbers = policies.map((p) => p.number);
              const state = policies.map((p) => p.riskState);
              const { firstName, lastName, email: mdmEmail, mdmId } = customerData;
              const { club_code: clubCodeMetadata, isGuestUser } = this.store.selectSnapshot(
                MetadataState.userAnalyticsMetadata
              );
              const { deviceUuid, email } = this.store.selectSnapshot(MetadataState);
              const clubCodeConfig = this.store.selectSnapshot(ConfigState)?.club_code;
              const codeVersion = this.store.selectSnapshot(ConfigState.activeConfig)?.codeVersion;
              const custKey = this.store.selectSnapshot(CsaaAuthState)?.custKey;

              const traits = {
                first_name: firstName,
                last_name: lastName,
                mdm_id: mdmId,
                email,
                mdm_email: mdmEmail,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                is_guest_user: isGuestUser ? 'yes' : 'no',
                reg_id: custKey,
                policy_numbers: policyNumbers,
                state,
                club_code: clubCodeMetadata || clubCodeConfig,
                app_version: codeVersion,
                uuid: deviceUuid,
              };

              this.analyticsService.identify(traits);
            }
          })
        )
    );
  }

  dismissRefresher() {
    if (this.refresher) {
      this.refresher.complete();
      this.refresher = null;
    }
  }

  refreshData(refresher) {
    this.loading = true;
    this.refresher = refresher;
    Object.keys(this.errorMap).forEach((key) => (this.errorMap[key] = false));

    this.store
      .dispatch(new CustomerAction.ReloadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.ReloadPolicies())),
        switchMap(() =>
          this.store.dispatch([new PaymentAction.ReloadPayments(), new ClaimAction.ReloadClaims()])
        ),
        catchError((e) => {
          console.log('ERROR LOADING HOME', e);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(noop);
  }

  loadData() {
    this.loading = true;
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() =>
          this.store.dispatch([new PaymentAction.LoadPayments(), new ClaimAction.LoadClaims()])
        ),
        catchError((e) => {
          console.log('ERROR LOADING HOME', e);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(noop);

    zip(this.policies$, this.upcomingPayments$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        withErrorReporter(
          ([policiesActive, upcomingPayments]) => {
            if (policiesActive && upcomingPayments) {
              this.hasAutoPolicy = !!policiesActive.find(
                (policy) => policy.type === PolicyType.Auto
              );
              this.getLastAlertTime().subscribe(
                withErrorReporter((lastAlertTime: string) => {
                  // if we have no last alert time set or it has been more than X days since the last alert
                  if (
                    !this.didAlertThisSession &&
                    (!lastAlertTime ||
                      differenceInDays(+lastAlertTime, new Date(Date.now())) >
                        ALERT_TIMEOUT_IN_DAYS)
                  ) {
                    // payment due alert
                    const [firstPastDuePolicy] = this.store
                      .selectSnapshot(PaymentState.upcomingPaymentsPastDue)
                      .map((payment) =>
                        policiesActive.find((pol) => pol.number === payment.policyNumber)
                      )
                      .filter((p) => !!p);
                    if (firstPastDuePolicy) {
                      this.didAlertThisSession = true;
                      this.updateLastAlertTime();
                      this.showPaymentDueWarning(firstPastDuePolicy)?.then(noop);
                    }
                  }
                })
              );
            }
            // this.dismissRefresher();
          },
          (err) => {
            console.log('CSAA:', { err });
            // this shouldn't happen, the subjects include their own error handlers and emit safe values
            // this.dismissRefresher();
            this.errorHandler.handleError(err);
          }
        )
      );
  }

  async showPaymentDueWarning(pastDuePolicy: Policy) {
    const policies = this.store.selectSnapshot(PolicyState.activePolicies);
    this.analyticsService.trackEvent(EventName.PAYMENT_PAST_DUE_NOTICE, Category.payments, {
      event_type: EventType.MESSAGED,
      ...AnalyticsService.mapPolicy(...policies),
    });
    const alert = await this.alertCtrl.create({
      header: (pastDuePolicy && pastDuePolicy.number) || 'Past due',
      subHeader: (pastDuePolicy && pastDuePolicy.subtitle) || '',
      message: 'Payment is past due. The policy will be cancelled if the payment is not received.',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            alert.dismiss(false);
            return false;
          },
        },
        {
          text: 'Make Payment',
          handler: () => {
            alert.dismiss(true);
            this.routerService.navigateForward('csaa.payment.index').then(noop);
            return false;
          },
        },
      ],
    });
    alert.present();
  }

  ionViewDidLeave() {
    if (this.unsubscribe$) {
      this.unsubscribe$.next(true);
      this.unsubscribe$.complete();
    }
  }

  call() {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.global, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Call Service',
      method: 'phone',
    });
    this.callService.call(this.store.selectSnapshot(ContactInfoState.serviceNumber()));
  }

  trackWebLinkClicked() {
    this.analyticsService.trackEvent(EventName.MYPOLICY_LINK_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'MyPolicy Dashboard',
      link_placement: 'Home',
    });
  }

  hasError() {
    return Object.keys(this.errorMap).reduce((prev, key) => prev || this.errorMap[key], false);
  }

  backButtonClick() {
    this.routerService.backToClubHome();
  }
}
