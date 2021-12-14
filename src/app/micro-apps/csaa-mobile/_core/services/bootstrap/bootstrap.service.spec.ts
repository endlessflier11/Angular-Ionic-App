import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { BootstrapService } from './bootstrap.service';
import { AnalyticsService, MetadataService, RouterService, StorageService } from '..';
import {
  AnalyticsMockService,
  MetadataMockService,
  RollbarReporterMockService,
  StorageMockService,
  StoreTestBuilder,
} from '@app/testing';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  AppEndpointKey,
  AppEndpointsData,
  AppEndpointsEnum,
  AppEndpointsResponse,
} from '../../interfaces';
import { addDays, addSeconds } from 'date-fns';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import { ConfigState } from '../../store/states/config.state';
import { ConfigAction } from '../../store/actions';
import { Injector } from '@angular/core';
import { RollbarReporterService } from '../rollbar-reporter/rollbar-reporter.service';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';
const app = require('../../../assets/config/app-info');

describe('BootstrapService', () => {
  const DATE_NOW = Date.parse('2021-01-01');
  const RESPONSE_MAX_AGE = 172800; // 2 days
  let service: BootstrapService;
  let httpTestingController: jest.Mocked<HttpTestingController>;
  let storageService: jest.Mocked<StorageService>;
  let serviceLocatorUrl: string;
  let store: Store;

  // These keys don't come with the API response, we patch them in
  const lazyLoadedKeys: AppEndpointKey[] = ['policyDocumentByType'];

  const appEndpointsKeysWithoutPatch: AppEndpointKey[] = (() => {
    const data = Object.keys(AppEndpointsEnum) as AppEndpointKey[];
    // !data[k] === 'string keys'
    // !!data[k] === 'numeric  keys'
    return data.filter((k) => !data[k] && !lazyLoadedKeys.includes(k)) as AppEndpointKey[];
  })();

  const serviceLocatorResponse: AppEndpointsResponse = {
    endpoints: appEndpointsKeysWithoutPatch.reduce<any>(
      (acc, key) => (acc[key] = { url: key }) && acc,
      {}
    ),
  };

  // These are end products of applying suffix and patching missing keys
  const knownTransforms: { [k in AppEndpointKey]?: string } = {
    policyDocuments:
      serviceLocatorResponse.endpoints.policyDocuments.url + '/:policyNumber/:docType',
    policyDocumentByType:
      serviceLocatorResponse.endpoints.policyDocuments.url + '/:policyNumber/:productType/:docType',
    contentLegal: serviceLocatorResponse.endpoints.contentLegal.url + '/:contentName/wy',
  };

  const appEndpointsDataForStorage: AppEndpointsData = {
    endpoints: appEndpointsKeysWithoutPatch.reduce<any>(
      (acc, cur) => (acc[cur] = knownTransforms[cur] || cur) && acc,
      {}
    ),
    publicEndpointKeys: [],
  };
  const appEndpointsDataForStorageWithExpiry = (expireAt: Date): AppEndpointsData => ({
    ...appEndpointsDataForStorage,
    expireAt,
  });

  const fakeStorageData = (storageDataMap: { [k: string]: any }) => {
    storageService.set.mockImplementation(() => Promise.resolve(undefined));
    storageService.remove.mockImplementation(() => Promise.resolve(undefined));
    storageService.get.mockImplementation((key) => {
      expect(key).toEqual(
        expect.stringMatching(new RegExp(`(${Object.keys(storageDataMap).join('|')})`))
      );

      let value;
      try {
        value = JSON.parse(storageDataMap[key]);
      } catch {
        value = storageDataMap[key];
      }
      return Promise.resolve(value);
    });
  };

  const createService = (storageDataMap?: { [k: string]: any }) => {
    TestBed.configureTestingModule({
      imports: [
        CsaaCoreModule.forRoot(),
        CsaaHttpClientModule,
        HttpClientTestingModule,
        NgxsModule.forRoot([AppState]),
      ],
      providers: [
        { provide: StorageService, useClass: StorageMockService },
        { provide: MetadataService, useClass: MetadataMockService },
        {
          provide: AnalyticsService,
          useClass: AnalyticsMockService,
        },
        {
          provide: RollbarReporterService,
          useClass: RollbarReporterMockService,
        },
        { provide: RouterService, useClass: RouterMockService },
      ],
    });
    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    CsaaAppInjector.injector = TestBed.inject(Injector);
    httpTestingController = TestBed.inject(
      HttpTestingController
    ) as jest.Mocked<HttpTestingController>;
    storageService = TestBed.inject(StorageService) as jest.Mocked<StorageService>;
    if (storageDataMap) {
      fakeStorageData(storageDataMap);
    }
    service = TestBed.inject(BootstrapService);
    serviceLocatorUrl = 'SERVICE_LOCATOR_QA';

    store.dispatch(new ConfigAction.LoadAppEndpoints());
  };

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(DATE_NOW);
  });

  afterEach(() => {
    service = undefined;
    storageService = undefined;
    jest.spyOn(Date, 'now').mockRestore();
    httpTestingController.verify();
  });

  it('should be created', () => {
    createService();
    assertServiceLocatorRequestAndFlush();
    expect(service).toBeTruthy();
  });

  const assertServiceLocatorRequestAndFlush = () =>
    httpTestingController.expectOne(serviceLocatorUrl).flush(serviceLocatorResponse, {
      headers: {
        'cache-control': `public, max-age=${RESPONSE_MAX_AGE}`,
      },
    });

  // Case 1: Always fetch from network
  it('should always fetch and store data', fakeAsync(() => {
    let dataToBePersisted;
    createService({
      [StorageService.KEY.SERVICE_LOCATORS]: undefined,
    });
    flushMicrotasks();
    expect(storageService.get).not.toHaveBeenCalled();

    storageService.set.mockImplementationOnce((key, value) => {
      dataToBePersisted = JSON.parse(value);
      dataToBePersisted.data.expireAt = new Date(dataToBePersisted.data.expireAt);
      expect(key).toEqual(StorageService.KEY.SERVICE_LOCATORS);
      return Promise.resolve(undefined);
    });

    expect(store.selectSnapshot(ConfigState.endpointsLoading)).toBeTruthy();

    assertServiceLocatorRequestAndFlush();

    const exp = addSeconds(new Date(), RESPONSE_MAX_AGE);
    const data = appEndpointsDataForStorageWithExpiry(exp);
    expect(dataToBePersisted).toEqual({
      data,
      appVersion: app.version,
      expireAt: exp.toISOString(),
    });

    expect(store.selectSnapshot(ConfigState.endpointsLoaded)).toBeTruthy();
  }));

  // Case 2: Use cached endpoints when network fails
  it('should use cached data when loading from network fails', fakeAsync(() => {
    global.console.log = jest.fn();
    const exp = addDays(DATE_NOW, 1);
    createService({
      [StorageService.KEY.SERVICE_LOCATORS]: JSON.stringify({
        data: appEndpointsDataForStorageWithExpiry(exp),
        appVersion: app.version,
        expireAt: exp.toISOString(),
      }),
    });

    flushMicrotasks();
    expect(storageService.get).not.toHaveBeenCalled();
    expect(store.selectSnapshot(ConfigState.endpointsLoading)).toBeTruthy();
    httpTestingController
      .expectOne(serviceLocatorUrl)
      .flush({ code: '123', message: 'failed' }, { status: 400, statusText: 'Bad Request' });
    expect(storageService.set).not.toHaveBeenCalled();
    expect(storageService.get).toHaveBeenCalledTimes(1);
    flushMicrotasks();
    expect(store.selectSnapshot(ConfigState.endpointsLoaded)).toBeTruthy();
  }));

  // Case 3: Report error
  it('should report error when loading from network fails', fakeAsync(() => {
    global.console.log = jest.fn();
    const exp = addDays(DATE_NOW, 1);
    createService({
      [StorageService.KEY.SERVICE_LOCATORS]: JSON.stringify({
        data: appEndpointsDataForStorageWithExpiry(exp),
        appVersion: app.version,
        expireAt: exp.toISOString(),
      }),
    });

    flushMicrotasks();
    expect(storageService.get).not.toHaveBeenCalled();
    expect(store.selectSnapshot(ConfigState.endpointsLoading)).toBeTruthy();
    httpTestingController
      .expectOne(serviceLocatorUrl)
      .flush({ code: '123', message: 'failed' }, { status: 400, statusText: 'Bad Request' });
    expect(storageService.set).not.toHaveBeenCalled();
    expect(storageService.get).toHaveBeenCalledTimes(1);
    flushMicrotasks();
    expect(store.selectSnapshot(ConfigState.endpointsLoaded)).toBeTruthy();

    const rollbar = TestBed.inject(RollbarReporterService);
    expect(rollbar.report).toHaveBeenCalledTimes(1);
  }));

  // Case 4: Discard cached endpoints when version changed
  it('should discard endpoints when cached version is different', fakeAsync(() => {
    global.console.log = jest.fn();
    const exp = addDays(DATE_NOW, 1);
    const OLD_VERSION = '5.5.0';
    createService({
      [StorageService.KEY.SERVICE_LOCATORS]: JSON.stringify({
        data: appEndpointsDataForStorageWithExpiry(exp),
        appVersion: OLD_VERSION,
        expireAt: exp.toISOString(),
      }),
    });

    flushMicrotasks();
    expect(storageService.get).not.toHaveBeenCalled();
    expect(store.selectSnapshot(ConfigState.endpointsLoading)).toBeTruthy();
    httpTestingController
      .expectOne(serviceLocatorUrl)
      .flush({ code: '123', message: 'failed' }, { status: 400, statusText: 'Bad Request' });
    expect(storageService.set).not.toHaveBeenCalled();
    expect(storageService.get).toHaveBeenCalledTimes(1);
    flushMicrotasks();
    expect(store.selectSnapshot(ConfigState.endpointsLoaded)).toBeFalsy();
  }));
});
