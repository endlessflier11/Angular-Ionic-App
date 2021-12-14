import { Component, Input } from '@angular/core';
import { Category, EventName, EventType } from '../../../../_core/interfaces/analytics.interface';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import { CallService } from '../../../../_core/services/call.service';
import { EmailService } from '../../../../_core/services/email.service';

@Component({
  selector: 'csaa-agent-card',
  templateUrl: './agent-card.component.html',
  styleUrls: ['./agent-card.component.scss'],
})
export class AgentCardComponent {
  @Input() loading: boolean;
  @Input() header: string;
  @Input() subHeader: string;
  @Input() phoneNumber: string;
  @Input() emailAddress: string;
  @Input() emailSubject: string;

  constructor(
    private callService: CallService,
    private emailService: EmailService,
    private analyticsService: AnalyticsService
  ) {}

  trackAgentContact(method: 'email' | 'phone') {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      method,
      selection: 'Contact Adjustor',
    });
  }

  onCall() {
    this.trackAgentContact('phone');
    this.callService.call(this.phoneNumber);
  }

  onEmail() {
    this.trackAgentContact('email');
    this.emailService.mailTo(this.emailAddress, this.emailSubject);
  }
}
