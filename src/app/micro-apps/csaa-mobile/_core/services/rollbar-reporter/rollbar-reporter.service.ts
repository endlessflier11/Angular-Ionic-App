import { Injectable } from '@angular/core';
import * as Rollbar from 'rollbar';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { CsaaConfigEnv } from '../config/config.service';
import { CsaaConfig } from '../../interfaces';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../store/states/config.state';
import { onceTruthy } from '../../operators';
import { ConfigAction } from '../../store/actions';
const RollbarCtor = require('rollbar').default || require('rollbar');

const getRollbarConfig = (config: CsaaConfig): Rollbar.Configuration => ({
  environment: config.rollbarEnv,
  accessToken: config.rollbarAccessToken,
  captureIp: 'anonymize',
  captureUncaught: false,
  captureUnhandledRejections: false,
  scrubFields: [
    // Todo: verify that all sensitive fields are included
    'pin-code',
    'bank-account-name',
    'bank-account-number',
    'bank-account-number-confirmation',
    'bank-routing-number',
    'card-holder-name',
    'card-number',
    'card-expiration',
    'paymentCardExpirationDate',
    'paymentCardHolderName',
    'paymentCardNumber',
    'paymentBankAccountNumber',
    'paymentBankAccountHolderName',
    'fiRoutingNumber',
    'pmtSourcePhoneNumber',
    'verification-code',
    'passCode',
    'driverLicense',
    'zipCode',
  ],
  payload: {
    environment: config.rollbarEnv,
    client: {
      javascript: {
        /*eslint-disable @typescript-eslint/naming-convention*/
        guess_uncaught_frames: true,
        source_map_enabled: true,
        code_version:
          config.codeVersion +
          (config.env === CsaaConfigEnv.PROD ? '' : `-debug-${config.rollbarDebugBuildNumber}`),
        /*eslint-enable @typescript-eslint/naming-convention*/
      },
    },
  },
  transform: (payload: any) => {
    const regExp = /(http|ionic)(:\/\/localhost\/)/g;
    if (payload && payload.body && payload.body.trace && payload.body.trace.frames) {
      const frames = payload.body.trace.frames;
      for (let i = 0; i < frames.length; i++) {
        payload.body.trace.frames[i].filename = payload.body.trace.frames[i].filename.replace(
          regExp,
          'file:///'
        );
      }
    }
  },
});

@Injectable({
  providedIn: CsaaCommonModule,
})
export class RollbarReporterService {
  private readonly rollbar = new RollbarCtor({});

  constructor(private readonly store: Store) {
    this.store
      .select(ConfigState.configLoaded)
      .pipe(onceTruthy())
      .subscribe(() => {
        this.rollbar.configure(
          getRollbarConfig(this.store.selectSnapshot(ConfigState.activeConfig))
        );
        this.store.dispatch(new ConfigAction.CompleteRollbarSetup());
      });
  }

  public report(error: any): void {
    console.log('Rollbar Error Object: ', error);
    this.store
      .select(ConfigState.rollbarReady)
      .pipe(onceTruthy())
      .subscribe(() => this.rollbar.error(error));
  }
}
