import { Action, createSelector, Selector, State, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ContactInfoAction } from '../actions/contact-info.actions';
import { StateContactInfo } from '../../interfaces/phone-numbers.interface';
import { AppEndpointsEnum } from '../../../_core/interfaces';
import { HttpService } from '../../../_core/services/http/http.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { CLAIMS_NUMBER, EMERGENCY_NUMBER, SERVICE_NUMBER } from '../../../constants';
import { ConfigState } from './config.state';
import { onceTruthy } from '../../operators/conditional.operator';
import { of, zip } from 'rxjs';
import { trackRequest } from '../../operators/track-request.operator';

export interface ContactInfoStateModel {
  statesContactData: { [key: string]: StateContactInfo };
}

export const DEFAULT_RISK_STATE_KEY = '';
const DEFAULT_CONTACT_INFO: StateContactInfo = {
  claims: CLAIMS_NUMBER,
  claimsHoursOfOperation: [],
  customerService: SERVICE_NUMBER,
  customerServiceHoursOfOperation: [],
  eService: SERVICE_NUMBER,
  emergencyNumber: CLAIMS_NUMBER,
};

export const CONTACT_INFO_STATE_TOKEN = 'csaa_contactInfo';
export function getInitialContactInfoState() {
  return {
    statesContactData: {
      DEFAULT_RISK_STATE_KEY: DEFAULT_CONTACT_INFO,
    },
  };
}

@State<ContactInfoStateModel>({
  name: CONTACT_INFO_STATE_TOKEN,
  defaults: { ...getInitialContactInfoState() },
})
@Injectable()
export class ContactInfoState {
  constructor(private readonly store: Store, private readonly httpService: HttpService) {}

  public static forState(contactInfoState: ContactInfoStateModel, riskState: string) {
    return (
      contactInfoState.statesContactData[riskState || DEFAULT_RISK_STATE_KEY] ||
      DEFAULT_CONTACT_INFO
    );
  }

  @Selector()
  public static fallbackServiceNumber(): string {
    return SERVICE_NUMBER;
  }

  public static stateContactInfo(state?: string) {
    return createSelector([ContactInfoState], (contactInfoState: ContactInfoStateModel) => (
        contactInfoState.statesContactData[state || DEFAULT_RISK_STATE_KEY] || DEFAULT_CONTACT_INFO
      ));
  }

  public static customerServiceHoursOfOperation(state?: string) {
    return createSelector([ContactInfoState], (contactInfoState: ContactInfoStateModel) => {
      const contactInfoData = contactInfoState.statesContactData[state || DEFAULT_RISK_STATE_KEY];
      return contactInfoData ? contactInfoData.customerServiceHoursOfOperation : [];
    });
  }

  public static serviceNumber(state?: string) {
    return createSelector([ContactInfoState], ({ statesContactData }: ContactInfoStateModel) => {
      const contactInfoData = statesContactData[state || DEFAULT_RISK_STATE_KEY];
      return contactInfoData && contactInfoData.customerService
        ? contactInfoData.customerService
        : SERVICE_NUMBER;
    });
  }

  public static claimsNumber(state?: string) {
    return createSelector([ContactInfoState], (s: ContactInfoStateModel) => {
      const contactInfoData = s.statesContactData[state || DEFAULT_RISK_STATE_KEY];
      return contactInfoData && contactInfoData.claims ? contactInfoData.claims : CLAIMS_NUMBER;
    });
  }

  public static emergencyNumber(state?: string) {
    return createSelector([ContactInfoState], ({ statesContactData }: ContactInfoStateModel) => {
      const contactInfoData = statesContactData[state || DEFAULT_RISK_STATE_KEY];
      return contactInfoData && contactInfoData.emergencyNumber
        ? contactInfoData.emergencyNumber
        : EMERGENCY_NUMBER;
    });
  }

  @Action(ContactInfoAction.LoadContacts)
  loadContacts(
    { patchState, getState }: StateContext<ContactInfoStateModel>,
    { policies }: ContactInfoAction.LoadContacts
  ) {
    return this.store.select(ConfigState.configAndEndpointsLoaded).pipe(
      onceTruthy(),
      switchMap(() => {
        // - Get distinct states for all policies + DEFAULT_RISK_STATE_KEY
        // - Prepare http request for all
        // - Dispatch all as a zipped observable
        // - Save contact info for each state
        const { statesContactData } = getState();
        const alreadyLoaded = [...Object.keys(statesContactData)];
        const distinctStates = [
          ...new Set([
            DEFAULT_RISK_STATE_KEY,
            ...policies.map((p) => p.riskState || DEFAULT_RISK_STATE_KEY),
          ]),
        ].filter((state) => alreadyLoaded.indexOf(state) === -1);

        if (distinctStates.length === 0) {
          return of(getState());
        }

        return zip(
          ...distinctStates.map((state) =>
            this.httpService
              .getNamedResource<StateContactInfo>(AppEndpointsEnum.contactInformation, {
                params: { state },
              })
              .pipe(
                map((res) => ({ state, data: res.body })),
                // Tap - store state phone numbers whenever each completes regardless of zipped observable status
                tap(({ data }) => {
                  patchState({
                    statesContactData: {
                      ...getState().statesContactData,
                      [state]: data,
                    },
                  });
                })
              )
          )
        ).pipe(trackRequest(ContactInfoAction.LoadContacts));
      })
    );
  }
}
