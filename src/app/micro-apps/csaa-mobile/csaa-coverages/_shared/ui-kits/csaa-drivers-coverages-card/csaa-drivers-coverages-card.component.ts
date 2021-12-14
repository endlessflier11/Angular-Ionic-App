import { Component, Input } from '@angular/core';
import { Category, EventName, EventType } from '../../../../_core/interfaces/analytics.interface';
import { DriverCoverage, DriverCoverageType } from '../../../../_core/interfaces/driver.interface';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import { CsaaExpandableItemCardComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';

@Component({
  selector: 'csaa-drivers-coverages-card',
  templateUrl: './csaa-drivers-coverages-card.component.html',
  styleUrls: ['./csaa-drivers-coverages-card.component.scss'],
})
export class CsaaDriversCoveragesCardComponent extends CsaaExpandableItemCardComponent {
  @Input() drivers: DriverCoverage[] = [];
  @Input() loading = false;
  @Input() version: 1 | 2 = 1;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DriverCoverageType = DriverCoverageType;

  get filteredDrivers() {
    const ignoreList =
      Number(this.version) === 2 ? [DriverCoverageType.NotRated, DriverCoverageType.Excluded] : [];
    return this.drivers.filter((d) => !ignoreList.includes(d.coverageType));
  }

  constructor(private analyticsService: AnalyticsService) {
    super();
  }

  driverExpanded(driverCoverage: DriverCoverage) {
    this.analyticsService.trackEvent(EventName.DRIVER_COVERAGE_SELECTED, Category.coverages, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Driver Coverage',
      name: driverCoverage.fullName,
      coverages: driverCoverage,
    });
  }
}
