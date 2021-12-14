import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Policy, PolicyType } from '../../../../_core/interfaces';
import { Claim } from '../../../../_core/interfaces/claim.interface';

const TITLES = {
  /*eslint-disable @typescript-eslint/naming-convention*/
  Processed: 'Your Claim was Closed',
  Opened: 'Your Claim was Opened',
  Referred: 'Your Claim has been Referred',
  Payment: 'Amount Paid to Date',
  /*eslint-enable @typescript-eslint/naming-convention*/
};

@Component({
  selector: 'csaa-claims-history-card',
  templateUrl: './claims-history-card.component.html',
  styleUrls: ['./claims-history-card.component.scss'],
})
export class ClaimsHistoryCardComponent {
  @Input() loading: boolean;
  @Input() claim: Claim;
  @Input() policy: Policy;
  @Input() timezone: string = undefined;
  @Output() historyItemClick = new EventEmitter<any>();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyTypes = PolicyType;

  constructor() {}

  getTitleFor(eventType) {
    return TITLES[eventType];
  }

  itemClicked(item: any) {
    this.historyItemClick.emit(item);
  }
}
