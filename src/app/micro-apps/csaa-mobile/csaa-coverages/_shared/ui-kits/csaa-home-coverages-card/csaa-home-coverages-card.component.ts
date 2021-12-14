import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, EventName } from '../../../../_core/interfaces/analytics.interface';
import { PolicyType } from '../../../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import { CsaaCoverageListCardBaseComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';

@Component({
  selector: 'csaa-home-coverages-card',
  templateUrl: './csaa-home-coverages-card.component.html',
  styleUrls: ['./csaa-home-coverages-card.component.scss'],
})
export class CsaaHomeCoveragesCardComponent extends CsaaCoverageListCardBaseComponent {
  @Output() viewDeclarationClick = new EventEmitter<any>();
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
