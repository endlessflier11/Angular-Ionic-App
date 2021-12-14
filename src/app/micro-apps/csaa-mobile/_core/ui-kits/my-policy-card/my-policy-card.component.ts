import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SsoService, WebviewService } from '../../services';
import { WebDeeplinkLocation } from '../../interfaces';
import { interactWithLoader } from '../../operators';
import { withErrorReporter } from '../../helpers';

type LinkOption = 'policy' | 'autopay';

@Component({
  selector: 'csaa-my-policy-card',
  templateUrl: './my-policy-card.component.html',
  styleUrls: ['./my-policy-card.component.scss'],
})
export class MyPolicyCardComponent {
  @Input() text = '';
  @Input() link: LinkOption = 'policy';
  @Output() cardClick = new EventEmitter<any>();
  @Output() webviewDismissed = new EventEmitter<void>();

  constructor(private readonly ssoService: SsoService, private webviewService: WebviewService) {
    if (this.text === '') {
      this.text = 'Set up and manage AutoPay using the MyPolicy website';
    }
  }

  handleCardClick() {
    this.processDeeplinkForWeb();
    this.cardClick.emit();
  }

  public processDeeplinkForWeb = (): void => {
    let location = WebDeeplinkLocation.DASHBOARD;
    if (this.link === 'autopay') {
      location = WebDeeplinkLocation.TRANSACTIONS;
    }
    this.ssoService
      .generateWebDeeplink(location)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter(async (url) => {
          await this.webviewService.open(url);
          this.webviewDismissed.emit();
        })
      );
  };
}
