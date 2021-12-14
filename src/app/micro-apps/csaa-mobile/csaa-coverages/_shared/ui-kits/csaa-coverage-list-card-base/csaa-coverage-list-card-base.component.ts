import { Component, Input } from '@angular/core';
import { Coverage } from '../../../../_core/interfaces/policy.interface';

export class CsaaExpandableItemCardComponent {
  private openCard = undefined;

  toggleItemDetails(itemIndex: number) {
    if (this.openCard === itemIndex) {
      this.openCard = undefined;
      return;
    }

    this.openCard = itemIndex;
  }

  isItemOpen(itemIndex: number) {
    return this.openCard === itemIndex;
  }
}

@Component({
  selector: 'csaa-converage-list-card-base',
  template: `<div></div>`,
})
export class CsaaCoverageListCardBaseComponent extends CsaaExpandableItemCardComponent {
  @Input() coverages: Coverage[] = [];
  @Input() policyNumber = '';
  @Input() loading = false;
}
