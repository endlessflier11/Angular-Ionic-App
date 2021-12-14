import { Component, OnDestroy } from '@angular/core';
import { IonRefresher, Platform } from '@ionic/angular';
import { noop, Observable, Subscription } from 'rxjs';
import { Agent } from '../../_core/interfaces/agent.interface';
import { DocumentType, ProductType } from '../../_core/interfaces/document.interface';
import { Coverage, Policy, VehicleWithCoverage } from '../../_core/interfaces/policy.interface';
import { CustomErrorHandler } from '../../_core/shared/custom-error-handler';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { ActivatedRoute } from '@angular/router';
import { filter, finalize, map, switchMap } from 'rxjs/operators';
import { IonViewWillEnter, IonViewWillLeave } from '../../_core/interfaces';
import { RouterService } from '../../_core/services';
import { unsubscribeIfPresent, withErrorReporter } from '../../_core/helpers';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { PolicyState } from '../../_core/store/states/policy.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { CustomerAction, PolicyAction } from '../../_core/store/actions';

@Component({
  selector: 'csaa-vehicle-coverages',
  templateUrl: './vehicle-coverages.page.html',
  styleUrls: ['./vehicle-coverages.page.scss'],
})
export class CsaaVehicleCoveragesPage implements IonViewWillEnter, IonViewWillLeave, OnDestroy {
  agent: Agent;
  private policyNumber: string;
  private vehicleId: string;
  public policy$: Observable<Policy>;

  title: string;
  loading = false;
  coverages: Coverage[] = [];
  notCoverages: Coverage[] = [];
  refresher: IonRefresher;
  isAndroidPlatform: boolean;
  currentTheme: string;
  backButtonSubscription: Subscription;
  isPbeEligible$: Observable<boolean>;

  private readonly subsink = new SubSink();

  constructor(
    private readonly store: Store,
    private errorHandler: CustomErrorHandler,
    private policyDocumentHelper: PolicyDocumentHelper,
    private platform: Platform,
    private readonly activatedRoute: ActivatedRoute,
    private readonly routerService: RouterService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.isAndroidPlatform = this.platform.is('android');
  }

  ionViewWillEnter() {
    if (!this.policyNumber || !this.vehicleId) {
      this.activatedRoute.paramMap.subscribe(
        withErrorReporter((paramMap) => {
          this.policyNumber = paramMap.get('policyNumber');
          this.vehicleId = paramMap.get('vehicleId');
          this.initializePage();

          this.isPbeEligible$ = this.store
            .select(PolicyState.allowedEndorsements(this.policyNumber))
            .pipe(map((allowed) => !!allowed));
        })
      );
    }
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.onClickBack()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  private initializePage() {
    this.loading = true;
    this.dispatchLoadActions();

    this.policy$ = this.store
      .select(PolicyState.policyData(this.policyNumber))
      .pipe(filter((v) => !!v));
    this.subsink.add(
      this.policy$.subscribe(
        withErrorReporter(
          (policy) => {
            const [vehicle]: VehicleWithCoverage[] = policy.vehicles.filter(
              (v) => v.id === this.vehicleId
            );

            if (!vehicle) {
              throw new Error(
                `Vehicle [${this.vehicleId}] not found, for policy ${this.policyNumber}`
              );
            }

            const coverages = vehicle.coverages;
            this.title = vehicle.name;
            this.coverages = coverages.filter((c) => c.covered);
            this.notCoverages = coverages.filter((c) => !c.covered);
          },
          (error) => {
            error.report();
            this.errorHandler.handleError(error);
          }
        )
      )
    );
  }

  onClickBack() {
    this.routerService.back();
  }

  viewDeclaration() {
    this.policyDocumentHelper
      .openDocument(this.policyNumber, ProductType.Auto, DocumentType.Declarations)
      .then(noop);
  }

  doRefresh(refresher = null) {
    this.loading = true;
    this.refresher = refresher;
    this.dispatchReloadActions();
  }

  dispatchLoadActions() {
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
  }
}
