import { Component, Input, OnDestroy } from '@angular/core';
import { noop } from '../../_core/helpers';
import { Policy, PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService, RouterService } from '../../_core/services';
import { Category, EventName, EventType } from '../../_core/interfaces';
import { PolicyHelper } from '../../_core/shared/policy.helper';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { DocumentType } from '../../_core/interfaces/document.interface';
import { Select } from '@ngxs/store';
import { FetchState } from '../../_core/store/states/fetch.state';
import { PolicyAction } from '../../_core/store/actions';
import { combineLatest, Observable } from 'rxjs';
import { SubSink } from '../../_core/shared/subscription.helper';

@Component({
  selector: 'csaa-insurance-card',
  templateUrl: './insurance-card.component.html',
  styleUrls: ['./insurance-card.component.scss'],
})
export class InsuranceCardComponent implements OnDestroy {
  @Input() policies: Policy[] = [];
  @Select(FetchState.needsFetching(PolicyAction.LoadPolicies))
  policiesNeedsFetching$: Observable<boolean>;
  @Select(FetchState.isLoading(PolicyAction.LoadPolicies)) loadingPolicies$: Observable<boolean>;

  private readonly subsink = new SubSink();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public PolicyType = PolicyType;
  public loading: boolean;

  constructor(
    private routerService: RouterService,
    private analyticsService: AnalyticsService,
    private policyDocumentHelper: PolicyDocumentHelper
  ) {
    this.subsink.add(
      combineLatest([this.loadingPolicies$, this.policiesNeedsFetching$]).subscribe((values) => {
        this.loading = values.find(Boolean);
      })
    );
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  async insuranceCardClickHandler(policy: Policy) {
    if (policy.type === PolicyType.Auto) {
      this.analyticsService.trackEvent(EventName.AUTO_ID_CARDS_ACCESSED, Category.documents, {
        event_type: EventType.LINK_ACCESSED,
        link: 'Proof Of Insurance',
        ...AnalyticsService.mapPolicy(policy),
      });

      this.routerService
        .navigateForward('csaa.poi.index', { policyNumber: policy.number })
        .then(noop);
    } else if (policy.type === PolicyType.Home) {
      this.saveIdCardsToDevice(policy);
    }
  }

  // we don't show pup for Proof Of insurance cards
  get filteredPolicies() {
    return this.policies ? this.policies.filter((p) => p.type !== PolicyType.PUP) : [];
  }

  private saveIdCardsToDevice(policy: Policy) {
    this.analyticsService.trackEvent(EventName.PROOF_OF_INSURANCE_VIEWED, Category.documents, {
      event_type: EventType.FILE_DOWNLOADED,
      link: 'Proof Of Insurance',
      ...AnalyticsService.mapPolicy(policy),
    });

    const productType = PolicyHelper.prodTypeFromPolicyType(policy.type);
    return this.policyDocumentHelper.openDocument(
      policy.number,
      productType,
      DocumentType.Declarations
    );
  }
}
