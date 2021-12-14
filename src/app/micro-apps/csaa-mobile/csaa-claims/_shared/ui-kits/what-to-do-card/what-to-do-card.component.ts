import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'csaa-what-to-do-card',
  templateUrl: './what-to-do-card.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./what-to-do-card.component.scss'],
})
export class WhatToDoCardComponent {
  @Input() footerLabel = 'View More';
  @Input() cardSubtitle: string;
  @Input() footerButtonText: string;
  @Input() togglable = true;
  @Input() cardClass: string;
  @Output() footerButtonOnClick = new EventEmitter<any>();
  @Output() clicked = new EventEmitter<any>();
  open = false;
  @Output() toggleStateEvent = new EventEmitter<boolean>();

  trustedCardTitle;
  @Input()
  public set cardTitle(value) {
    this.trustedCardTitle = this.sanitizer.bypassSecurityTrustHtml(value);
  }
  public get cardTitle() {
    return this.trustedCardTitle;
  }

  constructor(private sanitizer: DomSanitizer) {}

  handleFooterButtonClick(event) {
    event.stopPropagation();
    event.preventDefault();
    this.footerButtonOnClick.emit({ event });
  }
  handleClickEvent() {
    if (this.togglable) {
      this.toggleOpenState();
    }
    this.clicked.emit();
  }

  toggleOpenState() {
    const nextState = !this.open;
    this.toggleStateEvent.emit(nextState);
    this.open = nextState;
  }
}
