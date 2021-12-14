import { Component, Input } from '@angular/core';
import { noop } from 'rxjs';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { Policy, PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { RouterService } from '../../_core/services/router/router.service';

@Component({
  selector: 'csaa-coverages-card',
  templateUrl: './coverages-card.component.html',
  styleUrls: ['./coverages-card.component.scss'],
})
export class CoveragesCardComponent {
  @Input() policies: Policy[] = [];
  @Input() loading = false;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  constructor(private analyticsService: AnalyticsService, private routerService: RouterService) {}

  async goToPolicyDetails(policy) {
    const { number: policyNumber } = policy;
    this.analyticsService.trackEvent(EventName.COVERAGES_VIEWED, Category.coverages, {
      event_type: EventType.OPTION_SELECTED,
      ...AnalyticsService.mapPolicy(policy),
    });

    this.routerService
      .navigateForward('csaa.coverages.index', {
        policyNumber,
      })
      .then(noop);
  }
}
