import { Component } from '@angular/core';
import { EventName, Category } from '../../../../_core/interfaces';
import { AnalyticsService } from '../../../../_core/services';

import { CsaaCoverageListCardBaseComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';

@Component({
  selector: 'csaa-vehicle-coverages-not-covered-card',
  templateUrl: 'csaa-coverages-vehicle-not-covered-card.component.html',
})
export class CsaaCoveragesVehicleNotCoveredCardComponent extends CsaaCoverageListCardBaseComponent {
  constructor(private analyticsService: AnalyticsService) {
    super();
  }

  onItemClick(coverage, index) {
    if (!this.isItemOpen(index)) {
      this.analyticsService.trackEvent(EventName.VEHICLE_COVERAGE_SELECTED, Category.coverages, {
        name: coverage.shortName,
      });
    }
    this.toggleItemDetails(index);
  }
}
