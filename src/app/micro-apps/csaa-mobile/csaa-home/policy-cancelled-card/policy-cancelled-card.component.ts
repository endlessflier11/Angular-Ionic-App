import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Policy } from '../../_core/interfaces/policy.interface';

@Component({
  selector: 'csaa-policy-cancelled-card',
  templateUrl: './policy-cancelled-card.component.html',
  styleUrls: ['./policy-cancelled-card.component.scss'],
})
export class PolicyCancelledCardComponent {
  @Input() policy: Policy;
  @Output() callService = new EventEmitter();
}
