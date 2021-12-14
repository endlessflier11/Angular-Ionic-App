import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { interactWithLoader } from '../../_core/operators';
import { WebDeeplinkLocation } from '../../_core/interfaces';
import { withErrorReporter } from '../../_core/helpers';
import { SsoService, WebviewService } from '../../_core/services';

@Component({
  selector: 'csaa-file-a-claim-card',
  templateUrl: './file-a-claim-card.component.html',
  styleUrls: ['./file-a-claim-card.component.scss'],
})
export class FileAClaimCardComponent {
  @Input() loading = false;
  @Output() webviewDismissed = new EventEmitter<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private webviewService: WebviewService,
    private readonly ssoService: SsoService
  ) {}

  public openFileAClaimPageInBrowser = () => {
    this.analyticsService.trackEvent(EventName.FILE_A_CLAIM_SELECTED, Category.claims, {
      event_type: EventType.LINK_ACCESSED,
      link: 'MyPolicy Claims',
      link_placement: 'Home',
    });
    this.ssoService
      .generateWebDeeplink(WebDeeplinkLocation.CLAIMS)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter(async (url) => {
          await this.webviewService.open(url);
          this.webviewDismissed.emit();
        })
      );
  };
}
