import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventType, Vehicle } from '../../../../_core/interfaces';
import { Category, EventName } from '../../../../_core/interfaces/analytics.interface';
import { Policy, PolicyType } from '../../../../_core/interfaces/policy.interface';
import { RouterService } from '../../../../_core/services';
import { AnalyticsService } from '../../../../_core/services/analytics.service';

@Component({
  selector: 'csaa-vehicles-coverages-card',
  templateUrl: './csaa-vehicles-coverages-card.component.html',
  styleUrls: ['./csaa-vehicles-coverages-card.component.scss'],
})
export class CsaaVehiclesCoveragesCardComponent {
  @Input() policy: Policy;
  @Input() loading = false;
  @Input() showDeclarations = false;
  @Output() viewDeclarationClick = new EventEmitter<any>();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly routerService: RouterService
  ) {}

  openVehicleCoverages(vehicle: Vehicle) {
    this.analyticsService.trackEvent(EventName.VEHICLE_COVERAGE_SELECTED, Category.coverages, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Vehicle Coverage',
      type: vehicle.name,
    });
    this.routerService.navigateForward('csaa.coverages.vehicle', {
      policyNumber: this.policy.number,
      policyType: this.policy.type.toString(),
      vehicleId: vehicle.id,
    });
  }
}
