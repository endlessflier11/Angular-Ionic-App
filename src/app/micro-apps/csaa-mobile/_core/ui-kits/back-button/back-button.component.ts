import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'csaa-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent {
  @Input()
  text = 'Back';
  @Output()
  back = new EventEmitter();
}
