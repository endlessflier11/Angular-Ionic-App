import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import {
  CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK,
  PageTestingModule,
  StorageMockService,
  StoreTestBuilder,
} from '@app/testing';
import { CsaaAuthState } from './auth.state';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { StorageService } from '../../services/storage/storage.service';
import { MetadataState } from './metadata.state';
import { CsaaAuthAction } from '../actions';

describe('CsaaAuthState', function () {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({ providesStorage: true, providesRouter: true }),
        CsaaCoreModule.forRoot(),
        NgxsModule.forRoot([AppState]),
      ],
    });
    store = TestBed.inject(Store);
    StoreTestBuilder.withInitialState().resetStateOf(store);
  });

  it('should set user is authenticated', async function () {
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeFalsy();
    await store.dispatch(
      new CsaaAuthAction.SetAccessToken({ accessToken: CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK })
    );
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeTruthy();
  });

  it('should set user is not authenticated when the token is null', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeTruthy();
    await store.dispatch(new CsaaAuthAction.SetAccessToken({ accessToken: null }));
    expect(store.selectSnapshot(CsaaAuthState.isLoggedIn)).toBeFalsy();
  });

  it('should populate club_code and email metadata from token', async function () {
    const previous = store.selectSnapshot(MetadataState.userAnalyticsMetadata);
    expect(previous.club_code).toBeFalsy();
    expect(previous.email).toBeFalsy();

    await store.dispatch(
      new CsaaAuthAction.SetAccessToken({ accessToken: CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK })
    );
    let tokenData;
    try {
      tokenData = JSON.parse(atob(CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK.split('.')[1]));
    } catch (error) {
      fail(error);
    }
    const { clubcode, sub } = tokenData;
    const current = store.selectSnapshot(MetadataState.userAnalyticsMetadata);
    expect(current.club_code).toBeTruthy();
    expect(current.club_code).toBe(clubcode);

    expect(current.email).toBeTruthy();
    expect(current.email).toBe(sub);
  });

  it('should pick user, username and custKey from token', async function () {
    const previous = store.selectSnapshot(CsaaAuthState);
    expect(previous.user).toBeFalsy();
    expect(previous.username).toBeFalsy();
    expect(previous.custKey).toBeFalsy();

    await store.dispatch(
      new CsaaAuthAction.SetAccessToken({ accessToken: CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK })
    );

    let tokenData;
    try {
      tokenData = JSON.parse(atob(CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK.split('.')[1]));
    } catch (error) {
      fail(error);
    }
    const { first_name, cust_key, sub } = tokenData;

    const current = store.selectSnapshot(CsaaAuthState);
    expect(current.user).toBeTruthy();
    expect(current.user).toBe(sub);
    expect(current.username).toBeTruthy();
    expect(current.username).toBe(first_name);
    expect(current.custKey).toBeTruthy();
    expect(current.custKey).toBe(cust_key);
  });

  it('should call StorageService and store access tokens', async function () {
    const storageService: StorageMockService = TestBed.inject(StorageService) as any;

    await store.dispatch(
      new CsaaAuthAction.SetAccessToken({ accessToken: CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK })
    );
    expect(storageService.set).toHaveBeenCalledTimes(2);
    expect(storageService.set).toHaveBeenCalledWith(
      StorageService.KEY.ACCESS_TOKEN,
      CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK
    );
    expect(storageService.set).toHaveBeenCalledWith(
      StorageService.KEY.IG_ACCESS_TOKEN,
      CSAA_IG_ACCESS_TOKEN_FIXTURE_MOCK
    );
  });

  it('should call StorageService and clean access tokens', async function () {
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    await store.dispatch(new CsaaAuthAction.SetAccessToken({ accessToken: null }));
    const storageService: StorageMockService = TestBed.inject(StorageService) as any;
    expect(storageService.set).toHaveBeenCalledTimes(2);
    expect(storageService.set).toHaveBeenCalledWith(StorageService.KEY.ACCESS_TOKEN, null);
    expect(storageService.set).toHaveBeenCalledWith(StorageService.KEY.IG_ACCESS_TOKEN, null);
  });
});
