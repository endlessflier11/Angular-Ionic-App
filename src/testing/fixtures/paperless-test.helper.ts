import {
  NotificationChannelItem,
  PaperlessNotificationsStatus,
  PolicyPaperlessPreference,
  PolicyPaperlessPreferencesApiResponse,
} from '../../app/micro-apps/csaa-mobile/_core/interfaces';
import { deepCopy } from '@app/testing';

export class PaperlessPreferencesResponseBuilder {
  private response: PolicyPaperlessPreferencesApiResponse = [];
  private current: PolicyPaperlessPreference;

  static new() {
    return new PaperlessPreferencesResponseBuilder();
  }

  addPolicy(policyNumber) {
    this.createEmptyCurrent(policyNumber);
    this.response.push(this.current);
    return this;
  }

  forPolicy(policyNumber) {
    this.current = this.response.find((p) => p.policyNumber === policyNumber);
    if (!this.current) {
      this.addPolicy(policyNumber);
    }
    return this;
  }

  setEnrollmentPending(email) {
    this.current.email.email = email;
    this.current.email.isPending = true;
    return this;
  }

  addPendingChannel(preferenceType: keyof typeof NotificationChannelItem) {
    this.checkCurentNotificationLists();
    const e = this.current.email;

    e.isPending = true;
    e.email = e.email || 'user@enrollment.email';
    e.notifications.push(preferenceType);
    e.notificationsDetail.push({
      preferenceType,
      preferenceAction: PaperlessNotificationsStatus.OPT_IN_PENDING,
    });
    return this;
  }

  addEnabledChannel(preferenceType: keyof typeof NotificationChannelItem) {
    this.checkCurentNotificationLists();
    const e = this.current.email;
    e.enabled = true;
    e.notifications.push(preferenceType);
    e.notificationsDetail.push({
      preferenceType,
      preferenceAction: PaperlessNotificationsStatus.OPT_IN,
    });
    return this;
  }

  addDisabledChannel(preferenceType: keyof typeof NotificationChannelItem) {
    const e = this.current.email;
    e.notifications = e.notifications || [];
    e.notificationsDetail = e.notificationsDetail || [];
    this.checkCurentNotificationLists();
    this.current.email.notifications.push(preferenceType);
    this.current.email.notificationsDetail.push({
      preferenceType,
      preferenceAction: PaperlessNotificationsStatus.OPT_OUT,
    });
    return this;
  }

  enableSms(phoneNumber) {
    this.current.sms.enabled = true;
    this.current.sms.phoneNumber = phoneNumber;
    this.current.sms.notifications = ['AUTOPAY_ALERT'];
    this.current.sms.notificationsDetail = [
      { preferenceType: 'AUTOPAY_ALERT', preferenceAction: 'OPT_IN' },
    ];
    return this;
  }

  disableSms() {
    this.current.sms = {};
    return this;
  }

  getResponse() {
    return deepCopy(this.response);
  }

  private createEmptyCurrent(policyNumber) {
    this.current = { policyNumber, email: {}, sms: {} };
  }

  private checkCurentNotificationLists() {
    const e = this.current.email;
    e.notifications = e.notifications || [];
    e.notificationsDetail = e.notificationsDetail || [];
  }
}
