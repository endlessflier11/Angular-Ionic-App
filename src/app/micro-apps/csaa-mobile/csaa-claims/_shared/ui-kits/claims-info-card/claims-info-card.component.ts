import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'csaa-claims-info-card',
  templateUrl: './claims-info-card.component.html',
  styleUrls: ['./claims-info-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClaimsInfoCardComponent {
  @Input() title;
  @Input() text;
}
