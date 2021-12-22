import { Component, Input } from '@angular/core';
import {
  EventName,
  Category,
  VehicleWithCoverage,
  EventType,
  Policy,
} from '../../../../_core/interfaces';
import { AnalyticsService } from '../../../../_core/services';

import { CsaaCoverageListCardBaseComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';

@Component({
  selector: 'csaa-vehicle-coverages-not-covered-card',
  templateUrl: 'csaa-coverages-vehicle-not-covered-card.component.html',
})
export class CsaaCoveragesVehicleNotCoveredCardComponent extends CsaaCoverageListCardBaseComponent {
  @Input() policy: Policy;
  @Input() vehicle: VehicleWithCoverage;

  constructor(private analyticsService: AnalyticsService) {
    super();
  }

  onItemClick(coverage, index) {
    if (!this.isItemOpen(index)) {
      this.analyticsService.trackEvent(EventName.VEHICLE_COVERAGE_SELECTED, Category.coverages, {
        event_type: EventType.LINK_ACCESSED,
        link: 'Vehicle Coverage',
        type: this.vehicle?.name,
        name: coverage.shortName,
        ...AnalyticsService.mapPolicy(this.policy),
      });
    }
    this.toggleItemDetails(index);
  }
}
