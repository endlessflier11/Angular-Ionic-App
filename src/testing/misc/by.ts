import { By as NgBy } from '@angular/platform-browser';
import { DebugElement, Predicate } from '@angular/core';

export class By extends NgBy {
  /**
   * Returns a predicate that checks if an HTML element that matches selector
   * contains given text.
   *
   * @param selector the CSS selector
   * @param text the text to look for in the HTML element block
   * @param exactMatch default false
   */
  static cssAndText(selector: string, text: string, exactMatch = false): Predicate<DebugElement> {
    return (debugElement) => {
      const matchesSelector = this.css(selector)(debugElement);
      if (!matchesSelector) {
        return false;
      }
      return exactMatch
        ? debugElement.nativeElement.textContent === text
        : debugElement.nativeElement.textContent.indexOf(text) !== -1;
    };
  }

  static testId(id: string): Predicate<DebugElement> {
    return (debugElement) => this.css(`[data-testid=${id}]`)(debugElement);
  }
}
