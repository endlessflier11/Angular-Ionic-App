import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Category,
  EventName,
  EventType,
  NotificationChannelItem,
  PaperlessNotificationsStatus,
  Policy,
  PolicyPaperlessPreference,
  PolicyType,
  WebDeeplinkLocation,
} from '../../../_core/interfaces';
import { AnalyticsService, SsoService, WebviewService } from '../../../_core/services';
import { interactWithLoader } from '../../../_core/operators';
import { withErrorReporter } from '../../../_core/helpers';

@Component({
  selector: 'csaa-policy-paperless-preference-card',
  templateUrl: './csaa-policy-paperless-preference-card.component.html',
  styleUrls: ['./csaa-policy-paperless-preference-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsaaPolicyPaperlessPreferenceCardComponent {
  @Output() webviewDismissed: EventEmitter<void> = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<boolean>();
  @Input() preference?: PolicyPaperlessPreference;
  @Input() loading?: boolean;
  @Input() policy: Policy;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public PolicyType = PolicyType;

  constructor(
    private readonly webviewService: WebviewService,
    private readonly analyticsService: AnalyticsService,
    private readonly ssoService: SsoService
  ) {}

  public get policyTypeTitle(): string {
    if (!this.policy) {
      return '';
    }
    switch (this.policy.type) {
      case PolicyType.Auto:
        return 'Vehicles';
      case PolicyType.Home:
        return 'Home Insurance';
      case PolicyType.PUP:
        return 'Umbrella Policy';
    }
  }

  public get activeBillingNotificationItems(): string[] {
    if (!this.preference || !this.preference.email.enabled) {
      return [];
    }
    return (
      [
        [NotificationChannelItem.PAYMENT_REMINDER, 'Payment Reminder'],
        [NotificationChannelItem.PAYMENT_CONFIRMATION, 'Payment Confirmation'],
      ] as [NotificationChannelItem, string][]
    )
      .map(([channel, label]) => (this.isEmailNotificationActive(channel) ? label : undefined))
      .filter(Boolean);
  }

  public get textAlertsStatus(): 'On' | 'Off' {
    if (!this.preference) {
      return 'Off';
    }

    return this.preference.sms.enabled ? 'On' : 'Off';
  }

  public get policyEmailAlertsStatus(): 'Email' | 'Off' {
    return this.isEmailActive(NotificationChannelItem.POLICY_DOCUMENTS);
  }

  public isEmailActive(channel: NotificationChannelItem) {
    if (!this.preference) {
      return 'Off';
    }

    return this.isEmailNotificationActive(channel) ? 'Email' : 'Off';
  }

  public get billEmailAlertsStatus(): 'Email' | 'Off' {
    return this.isEmailActive(NotificationChannelItem.BILL_NOTIFICATION);
  }

  private isEmailNotificationActive(channel: NotificationChannelItem) {
    return (
      this.preference?.email?.notificationsDetail?.find((d) => d.preferenceType === channel)
        ?.preferenceAction === PaperlessNotificationsStatus.OPT_IN
    );
  }

  public navigateToPreference(): void {
    this.analyticsService.trackEvent(EventName.EDIT_PAPERLESS_SELECTED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      ...AnalyticsService.mapPolicy(this.policy),
    });
    const location = WebDeeplinkLocation.EDIT_POLICY_PAPERLESS_PREFERENCES.replace(
      '{policyNumber}',
      this.policy.number
    ) as WebDeeplinkLocation;

    this.ssoService
      .generateWebDeeplink(location)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter(async (url) => {
          await this.webviewService.open(url);
          this.webviewDismissed.emit();
        })
      );
  }

  public trackToggle(type: string, state: boolean) {
    if (!state) {
      return;
    }
    this.analyticsService.trackEvent(EventName.PAPERLESS_CARD_EXPANDED, Category.global, {
      selection: type,
      event_type: EventType.UX_MODIFIED,
      ...AnalyticsService.mapPolicy(this.policy),
    });
  }

  isPendingEnrollment() {
    return this.preference?.email?.isPending;
  }

  onAccepted(status) {
    this.accepted.emit(status);
  }
}
