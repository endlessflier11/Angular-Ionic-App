import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRefresher, Platform } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { noop, Observable, Subscription } from 'rxjs';
import { filter, finalize, map, switchMap } from 'rxjs/operators';
import { withErrorReporter } from '../../_core/helpers';
import { unsubscribeIfPresent } from '../../_core/helpers/async.helper';
import { Agent } from '../../_core/interfaces/agent.interface';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { DocumentType } from '../../_core/interfaces/document.interface';
import { Policy, PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { RouterService } from '../../_core/services/router/router.service';
import { CustomErrorHandler } from '../../_core/shared/custom-error-handler';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { PolicyHelper } from '../../_core/shared/policy.helper';
import { ConfigState } from '../../_core/store/states/config.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { PolicyState } from '../../_core/store/states/policy.state';
import { CustomerAction, PolicyAction } from '../../_core/store/actions';

@Component({
  selector: 'csaa-coverages-index',
  templateUrl: './coverages-index.page.html',
  styleUrls: ['./coverages-index.page.scss'],
})
export class CsaaCoveragesIndexPage implements OnInit, OnDestroy {
  policyNumber: string;
  policyType: PolicyType;

  currentTheme: string;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyTypes = PolicyType;
  loading = false;
  vehiclesWithLiabilityCoverage = 0;

  policy$: Observable<Policy>;
  isPbeEligible$: Observable<boolean>;

  agent: Agent;
  isAndroidPlatform: boolean;

  backButtonSubscription: Subscription;

  private refresher: IonRefresher;
  private readonly subsink = new SubSink();

  constructor(
    private store: Store,
    private errorHandler: CustomErrorHandler,
    private analyticsService: AnalyticsService,
    private policyDocumentHelper: PolicyDocumentHelper,
    private platform: Platform,
    private route: ActivatedRoute,
    private routerService: RouterService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.isAndroidPlatform = this.platform.is('android');
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.route.paramMap.subscribe(
      withErrorReporter((paramMap) => {
        if (!paramMap.has('policyNumber')) {
          this.routerService.back();
        }

        this.policyNumber = paramMap.get('policyNumber');
        this.policy$ = this.store
          .select(PolicyState.policyData(this.policyNumber))
          .pipe(filter((v) => !!v));

        this.isPbeEligible$ = this.store
          .select(PolicyState.allowedEndorsements(this.policyNumber))
          .pipe(map((allowed) => !!allowed));

        this.subsink.add(
          this.policy$.subscribe(
            withErrorReporter(
              (policy) => {
                this.policyType = policy.type;
                this.agent = policy.agent;
                this.vehiclesWithLiabilityCoverage = policy.vehicles.length;
                policy.vehicles.forEach((vehicle) => {
                  if (vehicle.riskFactors.waivedLiability === true) {
                    this.vehiclesWithLiabilityCoverage -= 1;
                  }
                });
              },
              (error) => {
                error.report();
                this.errorHandler.handleError(error);
              }
            )
          )
        );
        this.dispatchLoadAction();
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

  doRefresh(event = null) {
    this.loading = true;
    this.refresher = event?.target;
    this.dispatchReloadActions();
  }

  viewDeclaration() {
    this.analyticsService.trackEvent(EventName.VIEW_DECLARATIONS, Category.coverages, {
      event_type: EventType.FILE_DOWNLOADED,
      file: 'Declaration',
    });
    const productType = PolicyHelper.prodTypeFromPolicyType(this.policyType);
    this.policyDocumentHelper.openDocument(
      this.policyNumber,
      productType,
      DocumentType.Declarations
    );
  }

  backButtonClick() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.back();
  }

  allVehiclesWaivedLiability(): boolean {
    return this.vehiclesWithLiabilityCoverage > 0 ? false : true;
  }

  onAgentContact(method) {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.coverages, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Call Service',
      method,
    });
  }

  private dispatchLoadAction() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() =>
          this.store.dispatch(new PolicyAction.LoadAllowedEndorsements(this.policyNumber))
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  dispatchReloadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.ReloadPolicies())),
        switchMap(() =>
          this.store.dispatch(new PolicyAction.ReloadAllowedEndorsements(this.policyNumber))
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
    }
  }
}
