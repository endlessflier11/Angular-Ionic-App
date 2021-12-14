import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'csaa-no-active-policies-card',
  templateUrl: './no-active-policies-card.component.html',
  styleUrls: ['./no-active-policies-card.component.scss'],
})
export class NoActivePoliciesCardComponent {
  @Input() loading: boolean;
  @Output() callService: EventEmitter<any> = new EventEmitter();
}
