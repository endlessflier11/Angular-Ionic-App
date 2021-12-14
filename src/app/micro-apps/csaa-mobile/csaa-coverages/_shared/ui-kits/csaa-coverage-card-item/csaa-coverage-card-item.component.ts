import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent } from '../../../../_core/interfaces/agent.interface';
import { Category, EventName } from '../../../../_core/interfaces/analytics.interface';
import { Coverage, PolicyType } from '../../../../_core/interfaces/policy.interface';
import { GlobalStateService, RouterService } from '../../../../_core/services';
import { AnalyticsService } from '../../../../_core/services/analytics.service';

export interface CoverageItemClickEvent {
  data: Coverage;
  event: any;
}

@Component({
  selector: 'csaa-coverage-card-item, csaa-indented-coverage-card-item',
  styleUrls: ['./csaa-coverage-card-item.component.scss'],
  templateUrl: 'csaa-coverage-card-item.component.html',
})
export class CsaaCoverageCardItemComponent {
  @Input() coverage: Coverage;
  @Input() policyNumber: string;
  @Input() policyType: PolicyType;
  @Input() agent: Agent;
  @Input() isOpen = false;
  @Output() itemClick = new EventEmitter<CoverageItemClickEvent>();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly routerService: RouterService,
    private readonly globalStateService: GlobalStateService
  ) {}

  isComprehensiveCoverage(): boolean {
    return this.coverage.code === 'COMP';
  }

  isGlassIndicatorSet(): boolean {
    const ind = this.coverage.extensions.find((elem) => elem.attrName === 'glassInd');
    if (ind && ind.attrValue) {
      return true;
    }

    return false;
  }

  async goToIndentedCoverages(event) {
    event.stopPropagation();
    event.preventDefault();

    this.analyticsService.trackEvent(EventName.INDENTED_COVERAGES_VIEWED, Category.coverages, {
      policy_number: this.policyNumber,
    });

    this.globalStateService.setIndentedCoverageDetailsState({
      coverage: this.coverage,
      agent: this.agent,
      policyNumber: this.policyNumber,
      policyType: this.policyType,
    });

    this.routerService.navigateForward('csaa.coverages.indented', {
      policyNumber: this.policyNumber,
    });

    //   TODO V5: create CsaaIndentedCoverageDetailsPage
    //   this.modalController.create({
    //     component: CsaaIndentedCoverageDetailsPage,
    //   componentProps:
    //   });
    // }
  }

  handleItemClick(event) {
    this.itemClick.emit({ data: this.coverage, event });
  }
}
