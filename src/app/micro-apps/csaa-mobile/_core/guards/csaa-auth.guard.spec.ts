/* eslint-disable @typescript-eslint/naming-convention */
import { TestBed } from '@angular/core/testing';
import { HttpBackend } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import {
  AUTH_STATE_FIXTURE_MOCK,
  AuthMockService,
  CONFIG_STATE_FIXTURE_MOCK,
  METADATA_STATE_FIXTURE_MOCK,
  StorageMockService,
  WebviewMockService,
} from '@app/testing';
import { IonicStorageModule } from '@ionic/storage';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { AnalyticsService, AuthService, StorageService, WebviewService } from '../services';
import { CsaaAuthGuard } from './csaa-auth.guard';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AnalyticsMockService } from '../../../../../testing/services/analytics-mock.service';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

const NOT_LOGGED_IN = {
  accessToken: { accessToken: null },
  igAccessToken: { accessToken: null },
  loggedIn: false,
  user: null,
};

describe('AuthGuard', () => {
  let guard: CsaaAuthGuard;
  let store: Store;

  const setStoreState = (authState = {}, configState = {}, metadataState = {}) => {
    store.reset({
      csaa_app: {
        ...store.snapshot().csaa_app,
        csaa_config: { ...CONFIG_STATE_FIXTURE_MOCK, ...configState },
        csaa_auth: { ...AUTH_STATE_FIXTURE_MOCK, ...authState },
        csaa_metadata: { ...METADATA_STATE_FIXTURE_MOCK, ...metadataState },
      },
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, CsaaCoreModule.forRoot(), IonicStorageModule.forRoot()],
      providers: [
        HttpBackend,
        { provide: AuthService, useClass: AuthMockService },
        {
          provide: StorageService,
          useClass: StorageMockService,
        },
        { provide: AnalyticsService, useClass: AnalyticsMockService },
        { provide: WebviewService, useClass: WebviewMockService },
      ],
    });
    store = TestBed.inject(Store);
    setStoreState();
    guard = TestBed.inject(CsaaAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should always allow routes outside csaa module root path', (done) => {
    setStoreState(NOT_LOGGED_IN);
    const obs = guard.canActivate(null, { url: '/some/other/route' } as any);
    expect(obs instanceof Observable).toBeTruthy();
    (obs as Observable<any>).subscribe((value) => {
      try {
        expect(value).toEqual(true);
        done();
      } catch (error) {
        done(error.message);
      }
    });
  });

  it('should allow access for logged in users', (done) => {
    const { moduleRootPath } = CONFIG_STATE_FIXTURE_MOCK;
    const obs = guard.canActivate(null, { url: moduleRootPath } as any);
    expect(obs instanceof Observable).toBeTruthy();
    (obs as Observable<any>).subscribe((value) => {
      try {
        expect(value).toEqual(true);
        done();
      } catch (error) {
        done(error.message);
      }
    });
  });

  it('should deny access for not logged in users, redirecting to nonInsuredRedirectTo value', (done) => {
    const nonInsuredRedirectTo = '/non-insured/redirect-to/path';
    const homeBackButtonRedirectTo = '/home-back/button/redirect-to';
    setStoreState(NOT_LOGGED_IN, { nonInsuredRedirectTo, homeBackButtonRedirectTo });
    const { moduleRootPath } = CONFIG_STATE_FIXTURE_MOCK;
    const obs = guard.canActivate(null, { url: moduleRootPath } as any);
    expect(obs instanceof Observable).toBeTruthy();
    (obs as Observable<any>).subscribe((value) => {
      try {
        expect(value instanceof UrlTree).toEqual(true);
        const urlSerializer = new DefaultUrlSerializer();
        const routeTo = urlSerializer.serialize(value);
        expect(routeTo).toBe(nonInsuredRedirectTo);
        done();
      } catch (error) {
        done(error.message);
      }
    });
  });

  it(
    'should deny access for not logged in users, ' +
    'redirecting to homeBackButtonRedirectTo when nonInsuredRedirectTo is not set',
    (done) => {
      const nonInsuredRedirectTo = null;
      const homeBackButtonRedirectTo = '/home-back/button/redirect-to';
      setStoreState(NOT_LOGGED_IN, { nonInsuredRedirectTo, homeBackButtonRedirectTo });
      const { moduleRootPath } = CONFIG_STATE_FIXTURE_MOCK;
      const obs = guard.canActivate(null, { url: moduleRootPath } as any);
      expect(obs instanceof Observable).toBeTruthy();
      (obs as Observable<any>).subscribe((value) => {
        try {
          expect(value instanceof UrlTree).toEqual(true);
          const urlSerializer = new DefaultUrlSerializer();
          const routeTo = urlSerializer.serialize(value);
          expect(routeTo).toBe(homeBackButtonRedirectTo);
          done();
        } catch (error) {
          done(error.message);
        }
      });
    }
  );

  it('should deny access for not logged in users, redirecting to / when others not set', (done) => {
    const nonInsuredRedirectTo = null;
    const homeBackButtonRedirectTo = null;
    setStoreState(NOT_LOGGED_IN, { nonInsuredRedirectTo, homeBackButtonRedirectTo });
    const { moduleRootPath } = CONFIG_STATE_FIXTURE_MOCK;
    const obs = guard.canActivate(null, { url: moduleRootPath } as any);
    expect(obs instanceof Observable).toBeTruthy();
    (obs as Observable<any>).subscribe((value) => {
      try {
        expect(value instanceof UrlTree).toEqual(true);
        const urlSerializer = new DefaultUrlSerializer();
        const routeTo = urlSerializer.serialize(value);
        expect(routeTo).toBe('/');
        done();
      } catch (error) {
        done(error.message);
      }
    });
  });

  it('should lead new user to CSAA home when accessing a deep path from previous user', (done) => {
    const { moduleRootPath } = CONFIG_STATE_FIXTURE_MOCK;
    const deepPath = `${moduleRootPath}/coverages/12345`;
    const newUser = 'newuser@testuser.example.com';

    const obs = guard.canActivate(null, { url: deepPath } as any);
    expect(obs instanceof Observable).toBeTruthy();
    (obs as Observable<any>).subscribe((value) => {
      try {
        expect(value).toEqual(true);
        // change user
        setStoreState({ user: newUser });

        // access previous user deep path
        const obs2 = guard.canActivate(null, { url: deepPath } as any);
        expect(obs2 instanceof Observable).toBeTruthy();
        (obs2 as Observable<any>).subscribe((value2) => {
          try {
            expect(value2 instanceof UrlTree).toEqual(true);
            const urlSerializer = new DefaultUrlSerializer();
            const routeTo = urlSerializer.serialize(value2);
            expect(routeTo).toBe(moduleRootPath);
            done();
          } catch (error) {
            done(error.message);
          }
        });
      } catch (error) {
        done(error.message);
      }
    });
  });
});
