import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, EventName } from '../../../../_core/interfaces/analytics.interface';
import { PolicyType } from '../../../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import { CsaaCoverageListCardBaseComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';

@Component({
  selector: 'csaa-pup-coverages-card',
  templateUrl: './csaa-pup-coverages-card.component.html',
  styleUrls: ['./csaa-pup-coverages-card.component.scss'],
})
export class CsaaPupCoveragesCardComponent extends CsaaCoverageListCardBaseComponent {
  @Output() viewDeclarationClick: EventEmitter<any> = new EventEmitter<any>();
  @Input() policy;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  constructor(private analyticsService: AnalyticsService) {
    super();
  }

  onItemClick(coverage, index) {
    if (!this.isItemOpen(index)) {
      this.analyticsService.trackEvent(EventName.COVERAGE_SELECTED, Category.coverages, {
        name: coverage.shortName,
      });
    }
    this.toggleItemDetails(index);
  }
}
