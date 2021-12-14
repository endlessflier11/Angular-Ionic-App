import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'csaa-accordion-item',
  styleUrls: ['./accordion-item.component.scss'],
  template: `
    <div (click)="toggle.emit(!opened)"><ng-content select="[slot=header]"></ng-content></div>
    <div class="accordion-body" [class.active]="opened"><ng-content></ng-content></div>
  `,
})
export class AccordionItemComponent {
  @Input() opened = false;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();
}
