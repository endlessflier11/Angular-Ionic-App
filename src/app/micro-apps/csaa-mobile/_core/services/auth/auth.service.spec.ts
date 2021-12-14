import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {
  CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK,
  StorageMockService,
  StoreTestBuilder,
} from '@app/testing';
import { MetadataService } from '../metadata.service';
import { StorageService } from '../storage/storage.service';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import { CsaaAuthState } from '../../store/states/auth.state';
import { ConfigState } from '../../store/states/config.state';
import { MetadataState } from '../../store/states/metadata.state';
import { CustomerState } from '../../store/states/customer.state';
import { PolicyState } from '../../store/states/policy.state';
import { PaymentState } from '../../store/states/payment.state';
import { ClaimState } from '../../store/states/claim.state';
import { RouterService } from '../router/router.service';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';

describe('AuthService', () => {
  let service: AuthService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: StorageMockService },
        {
          provide: MetadataService,
          useValue: {
            getApplicationContextMetadata: jest.fn(() => ({})),
          },
        },
        { provide: RouterService, useClass: RouterMockService },
      ],
      imports: [CsaaCoreModule.forRoot(), NgxsModule.forRoot([AppState])],
    });
    store = TestBed.inject(Store);
    StoreTestBuilder.withInitialState().resetStateOf(store);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set user is authenticated when receive a token', function () {
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeFalsy();
    expect(store.selectSnapshot(ConfigState.handleIgToken)).toBeFalsy();
    service.setAccessToken({ accessToken: CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK });
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeTruthy();
  });

  it('should logout a user', function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeTruthy();
    service.logout();
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeFalsy();
  });

  it('should reset Metadata state on logout', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    const previous = store.selectSnapshot(MetadataState.userAnalyticsMetadata);
    expect(previous.uuid).toBeTruthy();
    expect(previous.club_code).toBeTruthy();
    expect(previous.email).toBeTruthy();
    expect(previous.mdm_email).toBeTruthy();
    expect(previous.policies).toBeTruthy();

    await service.logout().toPromise();

    const current = store.selectSnapshot(MetadataState.userAnalyticsMetadata);
    expect(current.uuid).toBeTruthy();
    expect(current.club_code).toBeTruthy();
    expect(current.email).toBeFalsy();
    expect(current.mdm_email).toBeFalsy();
    expect(current.policies).toBeFalsy();
  });

  it('should reset Customer state on logout', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    const previous = store.selectSnapshot(CustomerState.customerData);
    expect(previous).toBeTruthy();
    expect(previous.mdmId).toBeTruthy();
    expect(previous.fullName).toBeTruthy();
    expect(previous.customerAddress).toBeTruthy();

    await service.logout().toPromise();

    const current = store.selectSnapshot(CustomerState.customerData);
    expect(current).toBeFalsy();
    expect(current?.mdmId).toBeFalsy();
    expect(current?.fullName).toBeFalsy();
    expect(current?.customerAddress).toBeFalsy();
  });

  it('should reset Policy state on logout', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    const previous = store.selectSnapshot(PolicyState.activePolicies);
    expect(previous?.length).toBeTruthy();

    await service.logout().toPromise();

    const current = store.selectSnapshot(PolicyState.activePolicies);
    expect(current?.length).toBeFalsy();
  });

  it('should reset Payment state on logout', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    const previous = store.selectSnapshot(PaymentState);
    expect(previous?.payments?.length).toBeTruthy();

    await service.logout().toPromise();

    const current = store.selectSnapshot(PaymentState);
    expect(current?.payments?.length).toBeFalsy();
  });

  it('should reset Claims state on logout', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    const previous = store.selectSnapshot(ClaimState);
    expect(previous?.length).toBeTruthy();

    await service.logout().toPromise();

    const current = store.selectSnapshot(ClaimState);
    expect(current?.length).toBeFalsy();
  });
});
