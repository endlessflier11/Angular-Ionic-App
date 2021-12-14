import loadSegment from './segment';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, noop, Observable, ReplaySubject } from 'rxjs';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { MetadataState } from '../store/states/metadata.state';
import { ConfigState } from '../store/states/config.state';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { onceTruthy } from '../operators';
import {
  Category,
  EventName,
  EventType,
  PaymentAccount,
  Policy,
  PolicyType,
  UpcomingPayment,
} from '../interfaces';
import { delay } from '../helpers/async.helper';
import { ConfigAction, CustomerAction, MetadataAction, PolicyAction } from '../store/actions';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { FetchState } from '../store/states/fetch.state';

const MAX_SUBJECT_BUFFER_SIZE = 10;

@Injectable({
  providedIn: CsaaCommonModule,
})
export class AnalyticsService {
  private readonly identifySubject: ReplaySubject<any> = new ReplaySubject(MAX_SUBJECT_BUFFER_SIZE);
  private readonly trackSubject: ReplaySubject<any> = new ReplaySubject(MAX_SUBJECT_BUFFER_SIZE);
  private readonly pageSubject: ReplaySubject<any> = new ReplaySubject(MAX_SUBJECT_BUFFER_SIZE);
  private traits = {};

  @Select(MetadataState.userAnalyticsDataLoaded) isGlobalPropertiesLoaded: Observable<boolean>;

  private $userIdentified = new BehaviorSubject<boolean>(false);
  private $onError = new BehaviorSubject<boolean>(false);
  private $userIdentifiedOrError = combineLatest([this.$userIdentified, this.$onError]).pipe(
    map((values) => !!values.find(Boolean))
  );
  private $globalPropertiesLoadedOrError;

  constructor(private readonly store: Store, private readonly actions$: Actions) {
    this.$globalPropertiesLoadedOrError = merge([
      this.isGlobalPropertiesLoaded,
      this.$onError.pipe(filter((v) => !!v)),
    ]);
    this.prepareSegmentJavascript().then(noop);
  }

  public static mapPolicy(...policies: Policy[]) {
    return {
      policies: policies.map((p: Policy) => ({
        policy_number: p.number,
        policy_type: PolicyType[p.type],
        policy_state: p.riskState,
      })),
    };
  }

  public static mapPaymentPolicy(...payments: UpcomingPayment[]) {
    return {
      policies: payments.map((pmt) => ({
        policy_number: pmt.policyNumber,
        policy_type: PolicyType[pmt.policyType],
        policy_state: pmt.policyRiskState,
      })),
    };
  }

  public static mapPaymentMethod(paymentAccount: PaymentAccount) {
    return paymentAccount.card
      ? paymentAccount?.card?.type?.toLowerCase() === 'debit'
        ? 'Debit'
        : 'Credit'
      : paymentAccount?.account?.bankAccountType?.toLowerCase() === 'checking'
      ? 'Checking'
      : 'Saving';
  }

  private getUserId() {
    const state = this.store.selectSnapshot(MetadataState.userAnalyticsMetadata);
    return state?.mdm_id || state?.email;
  }

  public page() {
    this.$userIdentifiedOrError.pipe(onceTruthy()).subscribe(() => {
      this.pageSubject.next();
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public identify(newTraits: object) {
    this.traits = { ...this.traits, ...newTraits };
    this.identifySubject.next({ userId: this.getUserId(), traits: this.traits });
  }

  public trackEvent(
    eventName: EventName,
    category: Category,
    properties: { event_type?: EventType; [key: string]: any } = {}
  ) {
    if (eventName === EventName.ERROR_NOTIFICATION) {
      this.$onError.next(true);
    }

    this.$userIdentifiedOrError
      .pipe(
        onceTruthy(),
        switchMap(() => this.$globalPropertiesLoadedOrError.pipe(onceTruthy())),
        takeUntil(this.actions$.pipe(ofActionDispatched(MetadataAction.ResetMetadata)))
      )
      .subscribe(() => {
        const globalProps = this.store.selectSnapshot(MetadataState.userAnalyticsMetadata);
        const { email, mdm_email, uuid, mdm_id, policies, isGuestUser } = globalProps;
        let club_code = globalProps.club_code;
        const codeVersion = this.store.selectSnapshot(ConfigState.activeConfig)?.codeVersion;

        if (!club_code) {
          const { clubCode } = this.store.selectSnapshot(ConfigState);
          club_code = clubCode;
          if (!isGuestUser) {
            const m = `Analytics ERROR: club_code metadata from token is null. Using fallback ${clubCode} from module setup.`;
            console.log(`CSAA:${m}`, { globalProps });
          }
        }
        const payload = {
          event: eventName,
          properties: {
            // policies can be overridden:
            policies: Array.from(policies || []).map((p: Policy) => ({
              policy_number: p.number,
              policy_type: PolicyType[p.type],
              policy_state: p.riskState,
            })),
            ...properties,
            // so the below can't be overridden by the caller
            label: eventName,
            category: Category[category],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            is_guest_user: isGuestUser ? 'yes' : 'no',
            email,
            mdm_email,
            uuid,
            mdm_id,
            club_code,
            app_version: codeVersion,
          },
        };
        this.trackSubject.next(payload);
      });
  }

  private async prepareSegmentJavascript(): Promise<void> {
    loadSegment();
    // handle the case when analytics is not loaded yet
    while (!window.analytics || typeof window.analytics.load !== 'function') {
      await delay(500);
    }

    this.store
      .select(ConfigState.activeConfig)
      .pipe(onceTruthy())
      .subscribe(({ segmentToken }) => {
        window.analytics.load(segmentToken);
        this.completeSegmentSetup();
      });
  }

  private completeSegmentSetup(): void {
    this.store.dispatch(new ConfigAction.CompleteSegmentSetup());
    this.completeIdentifySetup().then(noop);
    this.completeTrackSetup().then(noop);
    this.completeTrackPageSetup().then(noop);

    this.actions$.pipe(ofActionDispatched(MetadataAction.ResetMetadata)).subscribe(() => {
      window.analytics.reset();
      this.$userIdentified.next(false);
      this.$onError.next(false);
    });

    combineLatest([
      this.store.select(FetchState.failed(CustomerAction.LoadCustomer)),
      this.store.select(FetchState.failed(PolicyAction.LoadPolicies)),
    ])
      .pipe(map((values) => !!values.find(Boolean)))
      .subscribe((value) => this.$onError.next(value));
  }

  /**
   * Waits for the analytics identify and push function and then subscribes to the identify subject
   */
  private async completeIdentifySetup() {
    while (
      !window.analytics ||
      typeof window.analytics.identify !== 'function' ||
      typeof window.analytics.push !== 'function'
    ) {
      await delay(500);
    }
    this.identifySubject.asObservable().subscribe((payload) => {
      const { userId, traits } = payload;
      try {
        window.analytics.identify(userId, traits);
        this.$userIdentified.next(true);
      } catch (e) {
        console.log(
          `CSAA: Unable to analytics.identify user ${userId || 'UNKNOWN'} due to ${
            e?.message || 'NO ERROR MESSAGE'
          }`,
          { userId, traits, error: e }
        );
      }
    });
  }

  /**
   * Waits for the analytics track and push functions and then subscribes to the track subject
   */
  private async completeTrackSetup() {
    while (
      !window.analytics ||
      typeof window.analytics.track !== 'function' ||
      typeof window.analytics.push !== 'function'
    ) {
      await delay(500);
    }
    this.trackSubject.asObservable().subscribe((payload) => {
      const { event, properties } = payload;
      try {
        window.analytics.track(event, properties);
      } catch (e) {
        console.log(
          `CSAA: Unable to analytics.track event due to ${e?.message || 'NO ERROR MESSAGE'}`,
          { event, properties, error: e }
        );
      }
    });
  }

  /**
   * Waits for the analytics page and push functions and then subscribes to the track subject
   */
  private async completeTrackPageSetup() {
    while (
      !window.analytics ||
      typeof window.analytics.page !== 'function' ||
      typeof window.analytics.push !== 'function'
    ) {
      await delay(500);
    }

    this.pageSubject.asObservable().subscribe(() => {
      try {
        window.analytics.page();
      } catch (e) {
        console.log(
          `CSAA: Unable to analytics.page event due to ${e?.message || 'NO ERROR MESSAGE'}`,
          { error: e }
        );
      }
    });
  }
}
