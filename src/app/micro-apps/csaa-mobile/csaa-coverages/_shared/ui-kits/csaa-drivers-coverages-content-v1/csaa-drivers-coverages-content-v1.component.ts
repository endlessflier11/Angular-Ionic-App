import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DriverCoverage, DriverCoverageType } from '../../../../_core/interfaces/driver.interface';
import { CsaaExpandableItemCardComponent } from '../csaa-coverage-list-card-base/csaa-coverage-list-card-base.component';

@Component({
  selector: 'csaa-csaa-drivers-coverages-content-v1',
  templateUrl: './csaa-drivers-coverages-content-v1.component.html',
  styleUrls: ['./csaa-drivers-coverages-content-v1.component.scss'],
})
export class CsaaDriversCoveragesContentV1Component
  extends CsaaExpandableItemCardComponent
  implements OnInit {
  @Input() public drivers: DriverCoverage[];
  @Output() public expandItem = new EventEmitter<DriverCoverage>();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DriverCoverageType = DriverCoverageType;

  constructor() {
    super();
  }

  ngOnInit() {}

  protected ignoreItemClick(coverageType: DriverCoverageType, itemIndex: number): boolean {
    const driver = this.drivers[itemIndex];
    return coverageType !== DriverCoverageType.Rated || driver.coverages.length === 0;
  }

  public handleDriverClick(coverageType: DriverCoverageType, itemIndex: number): void {
    if (this.ignoreItemClick(coverageType, itemIndex)) {return;}

    if (!this.isItemOpen(itemIndex)) {
      const driverCoverage = this.drivers[itemIndex];
      this.expandItem.emit(driverCoverage);
    }
    this.toggleItemDetails(itemIndex);
  }
}
