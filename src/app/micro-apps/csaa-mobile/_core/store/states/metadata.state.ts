import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { MetadataAction } from '../actions';
import { UserAnalyticsMetadata } from '../../interfaces/metadata.interface';
import { PolicyType } from '../../interfaces';

export interface MetadataStateModel {
  deviceUuid: string;
  isGuestUser: boolean;
  mdmId: string;
  email: string;
  mdm_email: string;
  clubCode: string;
  policies: {
    type: PolicyType;
    number: string;
    riskState: string;
  }[];
}

export const METADATA_STATE_TOKEN = 'csaa_metadata';

export const getInitialMetadataState = (): MetadataStateModel => ({
  isGuestUser: true,
  deviceUuid: undefined,
  mdmId: undefined,
  email: undefined,
  mdm_email: undefined,
  clubCode: undefined,
  policies: undefined,
});

@State<MetadataStateModel>({
  name: METADATA_STATE_TOKEN,
  defaults: {
    ...getInitialMetadataState(),
  },
})
@Injectable()
export class MetadataState {
  @Selector()
  static userAnalyticsDataLoaded(state: MetadataStateModel): boolean {
    const { clubCode, deviceUuid, policies, isGuestUser } = state;

    // For guests, we can't get so much info about them so we should proceed already.
    if (isGuestUser) {
      return true;
    }

    // Here we're ensuring that the
    // - clubCode was set (currently we get this value from auth token)
    // - Device uuid is set
    // - Policies are fetched (when fetched but empty, policies === []. Initially, policies === undefined).
    return Boolean(clubCode && deviceUuid && policies !== undefined);
  }

  @Selector()
  static userAnalyticsMetadata({
    clubCode,
    mdmId,
    deviceUuid,
    ...rest
  }: MetadataStateModel): UserAnalyticsMetadata {
    return {
      ...rest,
      uuid: deviceUuid,
      mdm_id: mdmId,
      club_code: clubCode,
    };
  }

  @Action(MetadataAction.ResetMetadata)
  resetMetadata({ patchState, getState }: StateContext<MetadataStateModel>) {
    // These two values are constants
    const { deviceUuid, clubCode } = getState();
    patchState({ ...getInitialMetadataState(), deviceUuid, clubCode });
  }

  @Action(MetadataAction.Initialize)
  initialize(
    { patchState, getState }: StateContext<MetadataStateModel>,
    action: MetadataAction.Initialize
  ) {
    const { clubCode } = getState();
    patchState({
      email: action.email,
      clubCode: action.clubCode || clubCode,
      isGuestUser: action.isGuestUser,
    });
  }

  @Action(MetadataAction.SetProperties)
  setProperties(
    { patchState }: StateContext<MetadataStateModel>,
    action: MetadataAction.SetProperties
  ) {
    patchState({ ...action.props });
  }

  @Action(MetadataAction.SetConstants)
  setConstants(
    { patchState }: StateContext<MetadataStateModel>,
    { deviceUuid, clubCode }: MetadataAction.SetConstants
  ) {
    patchState({ deviceUuid, clubCode });
  }
}
