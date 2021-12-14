import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'csaa-error-card',
  templateUrl: './error-card.component.html',
  styleUrls: ['./error-card.component.scss'],
})
export class ErrorCardComponent {
  @Input() loading: boolean;
  @Input() cardTitle: string;
  @Input() type: string;
  @Output() refreshData: EventEmitter<any> = new EventEmitter();

  handleRetry() {
    this.refreshData.emit();
  }
}
