import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { AccordionItemComponent } from './accordion-item.component';

@Component({
  selector: 'csaa-accordion',
  template: '<ng-content></ng-content>',
})
export class AccordionComponent implements AfterContentInit {
  @ContentChildren(AccordionItemComponent) panels: QueryList<AccordionItemComponent>;

  ngAfterContentInit() {
    this.panels.toArray().forEach((panel: AccordionItemComponent) => {
      panel.toggle.subscribe(() => {
        this.openPanel(panel);
      });
    });
  }

  openPanel(panel: AccordionItemComponent) {
    const next = !panel.opened;
    // close all panels
    this.panels.toArray().forEach((p) => (p.opened = false));
    // toggle the selected panel
    panel.opened = next;
  }
}
