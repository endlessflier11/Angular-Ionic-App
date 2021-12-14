import { Injectable } from '@angular/core';

import { ApplicationContextMetadata } from '../interfaces/metadata.interface';
import { Store } from '@ngxs/store';
import { MetadataState } from '../store/states/metadata.state';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { ConfigState } from '../store/states/config.state';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class MetadataService {
  private deviceUuid: string;

  constructor(private store: Store) {}

  getApplicationContextMetadata(
    transactionType: 'read' | 'write' = 'read'
  ): ApplicationContextMetadata {
    const { clubCode, mdmId } = this.store.selectSnapshot(MetadataState);
    const epoch = Date.now();
    const randValue = Math.random().toString(16).substr(2, 10);
    const club = clubCode || this.store.selectSnapshot(ConfigState)?.clubCode;
    const correlationId = `MMP_${club}_${epoch}_${randValue}`;
    const userId = mdmId || 'mobile_user';

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
