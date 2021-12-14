import { Category, EventName, EventType } from '../interfaces';

jest.mock('./segment');
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CONFIG_STATE_FIXTURE_MOCK, PageTestingModule, StoreTestBuilder } from '@app/testing';
import { getActionTypeFromInstance, NgxsModule, Store } from '@ngxs/store';
import { AnalyticsService } from './analytics.service';
import { AppState } from '../../../../_core/store';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { CustomerAction, FetchAction } from '../store/actions';

declare global {
  interface Window {
    analytics: any;
  }
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let store: Store;

  beforeEach(() => {
    window.analytics = {
      load: jest.fn(),
      identify: jest.fn(),
      push: jest.fn(),
      track: jest.fn(),
      page: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({
          providesRouter: true,
          providesMetadata: true,
          providesStorage: true,
        }),
        CsaaCoreModule.forRoot(),
        NgxsModule.forRoot([AppState]),
      ],
    });
    store = TestBed.inject(Store);
    const configState = { ...CONFIG_STATE_FIXTURE_MOCK, isNative: true };
    StoreTestBuilder.withDefaultMocks().withConfigState(configState).resetStateOf(store);
    service = TestBed.inject(AnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call segment track function', fakeAsync(function () {
    store.dispatch(
      new FetchAction.Error(
        getActionTypeFromInstance(CustomerAction.LoadCustomer),
        new Error('Failed')
      )
    );

    service.trackEvent(EventName.CONTACT_INITIATED, Category.global, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Call Service',
      method: 'phone',
    });
    const { codeVersion } = CONFIG_STATE_FIXTURE_MOCK.activeConfigData;

    expect(window.analytics.track).toHaveBeenCalled();
    expect(window.analytics.track).toHaveBeenCalledWith('Contact Initiated', {
      app_version: codeVersion,
      category: 'global',
      club_code: '005',
      email: 'A151@TESTUSER.EXAMPLE.COM',
      event_type: 'Option Selected',
      is_guest_user: 'no',
      label: 'Contact Initiated',
      mdm_email: 'A151@TESTUSER.EXAMPLE.COM',
      mdm_id: '1584030838880',
      method: 'phone',
      policies: [
        { policy_number: 'CAAC910026006', policy_state: 'CA', policy_type: 'Auto' },
        {
          policy_number: 'CAH3910026008',
          policy_state: 'CA',
          policy_type: 'Home',
        },
        {
          policy_number: 'CAPU910026011',
          policy_state: 'CA',
          policy_type: 'PUP',
        },
      ],
      selection: 'Call Service',
      uuid: '127.0.0.1',
    });
  }));
});
