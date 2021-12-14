import { Component, Input } from '@angular/core';
import { noop } from 'rxjs';
import { Category, EventName, EventType, Policy, PolicyType } from '../../_core/interfaces';
import { AnalyticsService, RouterService } from '../../_core/services';

@Component({
  selector: 'csaa-documents-card',
  templateUrl: './documents-card.component.html',
  styleUrls: ['./documents-card.component.scss'],
})
export class DocumentsCardComponent {
  @Input() policies: Policy[] = [];
  @Input() loading = false;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  constructor(private routerService: RouterService, private analyticsService: AnalyticsService) {}

  async goToPolicyDetails(policy) {
    const { number: policyNumber } = policy;

    this.analyticsService.trackEvent(EventName.DOCUMENTS_ACCESSED, Category.documents, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Documents',
      ...AnalyticsService.mapPolicy(policy),
    });

    this.routerService
      .navigateForward('csaa.documents.index', {
        policyNumber,
      })
      .then(noop);
  }
}
