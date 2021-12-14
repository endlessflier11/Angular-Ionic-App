import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRefresher, Platform } from '@ionic/angular';
import { noop, Observable, Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { reportError, withErrorReporter } from '../../_core/helpers';
import { unsubscribeIfPresent } from '../../_core/helpers/async.helper';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { DocumentType } from '../../_core/interfaces/document.interface';
import { Policy, PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { RouterService } from '../../_core/services/router/router.service';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { PolicyHelper } from '../../_core/shared/policy.helper';
import { CustomerSearchResponse, WebDeeplinkLocation } from '../../_core/interfaces';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { CustomerAction, PolicyAction } from '../../_core/store/actions';
import { PolicyState } from '../../_core/store/states/policy.state';
import { CustomerState } from '../../_core/store/states/customer.state';
import { SsoService } from '../../_core/services';
import { interactWithLoader } from '../../_core/operators';

@Component({
  selector: 'csaa-coverages-index',
  templateUrl: './poi-index.page.html',
  styleUrls: ['./poi-index.page.scss'],
})
export class CsaaPoiIndexPage implements OnInit {
  currentTheme: string;
  policyNumber: string;

  loading = false;
  policy$: Observable<Policy>;
  customerSearch$: Observable<CustomerSearchResponse>;
  private refresher: IonRefresher;

  backButtonSubscription: Subscription;

  selectedIdCardIndex: number = null;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;
  walletPassId: string;

  constructor(
    private store: Store,
    private analyticsService: AnalyticsService,
    private policyDocumentHelper: PolicyDocumentHelper,
    private platform: Platform,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private ssoService: SsoService
  ) {
    this.loading = true;
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.walletPassId = this.store.selectSnapshot(ConfigState.activeConfig).walletPassId;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      withErrorReporter((paramMap) => {
        this.policyNumber = paramMap.get('policyNumber');
        this.customerSearch$ = this.store.select(CustomerState.customerData);
        this.policy$ = this.store.select(PolicyState.policyData(this.policyNumber));
        this.dispatchLoadAction();
      })
    );
  }

  get vehiclesWithPoi() {
    const policy = this.getPolicy();
    return policy ? policy.vehicles.filter((v) => !!v.vin && !v.riskFactors.waivedLiability) : [];
  }

  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.backButtonClick()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  downloadWalletPass(): void {
    this.analyticsService.trackEvent(EventName.ADD_TO_APPLE_WALLET_SELECTED, Category.global, {
      event_type: EventType.FILE_DOWNLOADED,
      ...AnalyticsService.mapPolicy(this.getPolicy()),
    });
    const location = WebDeeplinkLocation.GET_WALLET_PASS.replace(
      '{policyNumber}',
      this.policyNumber
    ).replace('{walletPassId}', this.walletPassId);
    this.ssoService
      .generateWalletPasslink(encodeURIComponent(encodeURIComponent(location)))
      .pipe(interactWithLoader())
      .subscribe((link) => {
        window.open(link, '_system');
      });
  }

  doRefresh(event) {
    this.loading = true;
    this.refresher = event.target;
    this.dispatchReloadActions();
  }

  backButtonClick() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.back();
  }

  toggleIdCard(idx: number): void {
    this.selectedIdCardIndex = idx === this.selectedIdCardIndex ? null : idx;

    if (this.selectedIdCardIndex !== null) {
      const { make, model, year } = this.vehiclesWithPoi[this.selectedIdCardIndex];
      this.analyticsService.trackEvent(EventName.VEHICLE_ID_CARD_EXPANDED, Category.documents, {
        event_type: EventType.OPTION_SELECTED,
        link: 'Vehicle ID Card',
        make,
        model,
        vehicle_year: year,
        ...AnalyticsService.mapPolicy(this.getPolicy()),
      });
    }
  }

  async saveIdCardsToDevice() {
    this.analyticsService.trackEvent(EventName.PROOF_OF_INSURANCE_VIEWED, Category.documents, {
      event_type: EventType.FILE_DOWNLOADED,
      link: 'Proof Of Insurance',
      ...AnalyticsService.mapPolicy(this.getPolicy()),
    });

    try {
      const policy = this.getPolicy();
      switch (policy.type) {
        case PolicyType.Auto:
          await this.openProofOfInsurance(policy);
          break;
        default:
          throw new Error('Unrecognized policy type');
      }
    } catch (e) {
      reportError(e);
      this.policyDocumentHelper.displayFileDownloadError(this.policyNumber);
    }
  }

  private openProofOfInsurance(policy: Policy): Promise<void> {
    const productType = PolicyHelper.prodTypeFromPolicyType(policy.type);
    return this.policyDocumentHelper.openDocument(
      policy.number,
      productType,
      DocumentType.InsuranceCard
    );
  }

  dispatchLoadAction() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  dispatchReloadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.ReloadPolicies())),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
    }
    this.selectedIdCardIndex = null;
  }

  private getPolicy(): Policy {
    return this.store.selectSnapshot(PolicyState.policyData(this.policyNumber));
  }
}
