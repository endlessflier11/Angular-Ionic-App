import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SsoService } from '../../../../_core/services/sso/sso.service';
import { WebviewService } from '../../../../_core/services/webview/webview.service';
import {
  Category,
  EventName,
  PolicyType,
  Policy,
  EventType,
  VehicleWithCoverage,
} from '../../../../_core/interfaces';
import { AnalyticsService } from '../../../../_core/services';
import { WebDeeplinkLocation } from '../../../../_core/interfaces/auth.interface';
import { interactWithLoader } from '../../../../_core/operators/loader.operator';
import { withErrorReporter } from '../../../../_core/helpers/error.helper';

import { CsaaCoverageListCardBaseComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';
import { noop } from '../../../../_core/helpers';
@Component({
  selector: 'csaa-vehicle-coverages-covered-card',
  templateUrl: 'csaa-coverages-vehicle-covered-card.component.html',
  styleUrls: ['./csaa-coverages-vehicle-covered-card.component.scss'],
})
export class CsaaCoveragesVehicleCoveredCardComponent extends CsaaCoverageListCardBaseComponent {
  @Input() showEditPolicy: boolean;
  @Input() policy: Policy;
  @Input() vehicle: VehicleWithCoverage;
  @Output() viewDeclarationClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() webviewDismissed = new EventEmitter<void>();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

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
      link_placement: 'Vehicle Coverages',
      ...AnalyticsService.mapPolicy(this.policy),
    });

    this.ssoService
      .generateWebDeeplink(`${WebDeeplinkLocation.ENDORSMENT}?policyNumber=${policyNumber}`)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter((url) =>
          this.webviewService
            .open(url)
            .then(noop)
            .finally(() => this.webviewDismissed.emit())
        )
      );
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
