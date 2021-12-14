import { Directive, Input } from '@angular/core';

@Directive({ selector: '[brmasker]' })
/**
 * Set backgroundColor for the attached element to highlight color
 * and set the element's customProperty to true
 */
export class BrmaskerMockDirective {
  @Input('brmasker') brmask = '';

  constructor() {}
}
