import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GET_A_BUNDLE_QUOTE_URL, GET_A_QUOTE_URL } from '../../constants';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CsaaTheme, WebviewService } from '../../_core/services';
import { combineLatest, noop, Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { PolicyState } from '../../_core/store/states/policy.state';
import { CustomerSearchResponse, Policy } from '../../_core/interfaces';
import { CustomerState } from '../../_core/store/states/customer.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { ConfigState } from '../../_core/store/states/config.state';

@Component({
  selector: 'csaa-get-a-quote-card',
  templateUrl: './get-a-quote-card.component.html',
  styleUrls: ['./get-a-quote-card.component.scss'],
})
export class GetAQuoteCardComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;
  @Output() webviewDismissed = new EventEmitter<void>();
  @Select(CustomerState.customerData) customerSearch$: Observable<CustomerSearchResponse>;
  @Select(PolicyState.activePolicies) policies$: Observable<Policy[]>;
  @Select(PolicyState.hasAutoPolicy) hasAutoPolicy$: Observable<boolean>;
  @Select(PolicyState.isMonolineAutoPolicies) isMonolineAuto$: Observable<boolean>;
  @Select(PolicyState.isMonolinePropertyPolicies) isMonolineProperty$: Observable<boolean>;

  public isDiscountAvailable = false;
  private readonly discountableRiskStates = ['CA', 'UT', 'NV', 'AZ', 'MT', 'WY'];
  private customerSearch: CustomerSearchResponse;
  private subSink = new SubSink();

  public get hasAutoPolicy(): boolean {
    return this.store.selectSnapshot(PolicyState.hasAutoPolicy);
  }

  public get currentClubByTheme(): CsaaTheme {
    return this.store.selectSnapshot(ConfigState.theme);
  }

  public get quoteState(): string {
    return this.currentClubByTheme === CsaaTheme.MWG
      ? 'CA'
      : this.customerSearch.customerAddress.state;
  }

  constructor(
    private store: Store,
    private analyticsService: AnalyticsService,
    private webviewService: WebviewService
  ) {}

  ngOnInit(): void {
    this.subSink.add(
      this.customerSearch$.subscribe((customerSearch) => {
        this.customerSearch = customerSearch;
      }),
      combineLatest([this.policies$, this.isMonolineAuto$, this.isMonolineProperty$]).subscribe(
        ([policies, isMonolineAuto, isMonolineProperty]) => {
          if (!policies || policies.length === 0) {
            return;
          }
          const isAca = this.currentClubByTheme === CsaaTheme.ACA;
          this.isDiscountAvailable =
            !isAca &&
            (isMonolineAuto || isMonolineProperty) &&
            policies.every((p) => p.riskState && this.discountableRiskStates.includes(p.riskState));
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  public openQuoterInBrowser = () => {
    this.analyticsService.trackEvent(EventName.GET_A_QUOTE_SELECTED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
    });

    this.openUrl(
      this.isDiscountAvailable
        ? GET_A_BUNDLE_QUOTE_URL.replace('{state}', this.quoteState)
        : GET_A_QUOTE_URL
    ).then(noop);
  };

  async openUrl(target: string) {
    await this.webviewService.open(target);
    this.webviewDismissed.emit();
  }
}
