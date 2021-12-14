import { Injectable } from '@angular/core';
import { noop } from 'rxjs';
import {
  ApplicationContextMetadata,
  UserAnalyticsMetadata,
} from 'src/app/micro-apps/csaa-mobile/_core/interfaces/metadata.interface';
const STORAGE_KEY__CLUB_CODE = 'clubCode';

@Injectable({
  providedIn: 'root',
})
export class MetadataMockService {
  private userAnalyticsMetadata: UserAnalyticsMetadata;
  private clubCode: string;
  private storage = new Map();
  deviceUuid = 'fakeUUID';

  constructor() {
    this.resetMetadata().then(noop);
  }

  async resetMetadata(): Promise<void> {
    this.userAnalyticsMetadata = {};
    await this.setClubCode(null);
  }

  retrieveClubCode(): void {
    this.clubCode = this.storage.get(STORAGE_KEY__CLUB_CODE);
  }

  async setClubCode(value: string): Promise<void> {
    if (value) {
      this.storage.set(STORAGE_KEY__CLUB_CODE, value);
    } else {
      this.storage.delete(STORAGE_KEY__CLUB_CODE);
    }
    this.clubCode = value;
  }

  setUserAnalyticsMetadata(value: UserAnalyticsMetadata): void {
    if (!this.userAnalyticsMetadata.uuid && !value.uuid) {
      value.uuid = this.deviceUuid;
    }
    if (!this.clubCode) {
      this.retrieveClubCode();
    }
    this.userAnalyticsMetadata = { ...this.userAnalyticsMetadata, ...value };
  }

  getUserAnalyticsMetadata(): UserAnalyticsMetadata {
    return {
      ...this.userAnalyticsMetadata,
      club_code: this.clubCode,
    };
  }

  getApplicationContextMetadata(
    transactionType: 'read' | 'write' = 'read'
  ): ApplicationContextMetadata {
    const { mdm_id, club_code } = this.getUserAnalyticsMetadata();
    const epoch = new Date().getTime();
    const randValue = Math.random().toString(16).substr(2, 10);
    const club = club_code || '000';
    const correlationId = `MMP_${club}_${epoch}_${randValue}`;
    const userId = mdm_id || 'mobile_user';

    return {
      userId,
      transactionType,
      application: 'MyPolicyMobile',
      subSystem: 'CUSTPRL',
      address: this.deviceUuid,
      correlationId,
    };
  }
}
