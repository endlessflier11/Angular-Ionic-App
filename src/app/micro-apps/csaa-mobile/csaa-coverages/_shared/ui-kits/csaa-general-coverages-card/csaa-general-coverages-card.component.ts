import { Component, EventEmitter, Input, Output } from '@angular/core';
import { withErrorReporter } from '../../../../_core/helpers';
import { EventType, WebDeeplinkLocation } from '../../../../_core/interfaces';
import { interactWithLoader } from '../../../../_core/operators';
import { SsoService } from '../../../../_core/services';
import { WebviewService } from '../../../../_core/services';

import { Agent } from '../../../../_core/interfaces/agent.interface';
import { Category, EventName } from '../../../../_core/interfaces';
import { Policy, PolicyType } from '../../../../_core/interfaces';
import { AnalyticsService } from '../../../../_core/services';
import { CsaaCoverageListCardBaseComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';
import { noop } from '../../../../_core/helpers';

@Component({
  selector: 'csaa-general-coverages-card',
  templateUrl: './csaa-general-coverages-card.component.html',
  styleUrls: ['./csaa-general-coverages-card.component.scss'],
})
export class CsaaGeneralCoveragesCardComponent extends CsaaCoverageListCardBaseComponent {
  @Input() agent: Agent;
  @Input() policyType: PolicyType;
  @Input() policy: Policy;
  @Input() showEditPolicy: boolean;

  @Output() viewDeclarationClick = new EventEmitter<any>();
  @Output() webviewDismissed = new EventEmitter<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private webviewService: WebviewService,
    private readonly ssoService: SsoService
  ) {
    super();
  }

  openEditPolicy(policyNumber: string) {
    this.analyticsService.trackEvent(EventName.MYPOLICY_LINK_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Edit Policy',
      link_placement: 'Policy Coverages',
      ...AnalyticsService.mapPolicy(this.policy),
    });
    this.ssoService
      .generateWebDeeplink(`${WebDeeplinkLocation.ENDORSMENT}?policyNumber=${policyNumber}`)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter((url) => {
          this.webviewService
            .open(url)
            .then(noop)
            .finally(() => this.webviewDismissed.emit());
        })
      );
  }

  onItemClick(coverage, index) {
    if (!this.isItemOpen(index)) {
      this.analyticsService.trackEvent(EventName.GENERAL_COVERAGE_SELECTED, Category.coverages, {
        event_type: EventType.OPTION_SELECTED,
        selection: coverage.shortName,
      });
    }
    this.toggleItemDetails(index);
  }
}
