/* eslint-disable max-len */
import { TestBed } from '@angular/core/testing';

import { HttpService } from './http.service';
import { HTTP } from '@ionic-native/http/ngx';
import {
  AuthMockService,
  CONFIG_STATE_FIXTURE_MOCK,
  ConfigMockService,
  IonicHttpMockService,
  StorageMockService,
  StoreTestBuilder,
} from '@app/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from '../config/config.service';
import { Platform } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { MetadataService } from '../metadata.service';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { Store } from '@ngxs/store';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';
import { StorageService } from '../storage/storage.service';
import { AppEndpointsEnum, UniHttpAdapterTarget } from '../../interfaces';
import { IonicHttpAdapter } from './adapters/ionic-http.adapter';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';
import { RouterService } from '../router/router.service';

const SUCCESS_OPTIONS: { status?: number; statusText?: string } = { status: 200, statusText: 'OK' };
const ERROR_OPTIONS: { status?: number; statusText?: string } = {
  status: 500,
  statusText: 'Internal Server Error',
};

describe('HttpService', () => {
  let service: HttpService;
  let httpTestingController: HttpTestingController;
  let store: Store;
  let http: HTTP;

  function setupTestingModule(isNative = false) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CsaaCoreModule.forRoot(), CsaaHttpClientModule],
      providers: [
        { provide: HTTP, useClass: IonicHttpMockService },
        { provide: ConfigService, useClass: ConfigMockService },
        {
          provide: Platform,
          useValue: { is: jest.fn(), ready: jest.fn().mockResolvedValue(true) },
        },
        { provide: AuthService, useClass: AuthMockService },
        {
          provide: MetadataService,
          useValue: { getApplicationContextMetadata: jest.fn(() => ({})) },
        },
        { provide: StorageService, useClass: StorageMockService },
        { provide: RouterService, useClass: RouterMockService },
      ],
    });
    store = TestBed.inject(Store);
    const configState = { ...CONFIG_STATE_FIXTURE_MOCK, isNative };
    StoreTestBuilder.withDefaultMocks().withConfigState(configState).resetStateOf(store);
    service = TestBed.inject(HttpService);
    httpTestingController = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HTTP);
  }

  it('should be created', () => {
    setupTestingModule();
    expect(service).toBeTruthy();
  });

  describe.each([
    ['get', SUCCESS_OPTIONS],
    ['get', SUCCESS_OPTIONS, AppEndpointsEnum.health],
    ['get', ERROR_OPTIONS],
    ['get', ERROR_OPTIONS, AppEndpointsEnum.health],
    ['post', SUCCESS_OPTIONS],
    ['post', SUCCESS_OPTIONS, AppEndpointsEnum.health],
    ['post', ERROR_OPTIONS],
    ['post', ERROR_OPTIONS, AppEndpointsEnum.health],
  ])('Memory leak check', (verb, opts, named) => {
    beforeEach(() => setupTestingModule());
    afterEach(() => httpTestingController.verify());
    const serviceMethod = verb + (named ? 'NamedResource' : '');
    it(`should complete the http observable for ${
      opts.status === 200 ? 'successful' : 'failed'
    } ${serviceMethod} calls`, () => {
      const expectedEndpoint = named ? AppEndpointsEnum[AppEndpointsEnum.health] : '/endpoint';
      const subscription = service[serviceMethod](named || '/endpoint').subscribe();
      httpTestingController.expectOne(expectedEndpoint).flush('', opts);
      expect(subscription.closed).toBeTruthy();
    });
  });

  describe('compileUrlWithParams', function () {
    beforeEach(() => setupTestingModule());
    it('should keep simple HTTPS urls unchanged ', function () {
      const url =
        'https://mobile.api.dev.digital.pncie.com/ent/okta-qa/da/api/v1/contact/information';
      expect(HttpService.compileUrlWithParams(url, null)).toBe(url);
    });

    it('should keep simple HTTP urls unchanged', function () {
      const url = 'http://mobile.api.dev.digital.pncie.com/ent/okta-qa/da/api/v1/billing/autopay';
      expect(HttpService.compileUrlWithParams(url, null)).toBe(url);
    });

    it('should keep simple urls with port numbers unchanged', function () {
      const url =
        'https://mobile.api.dev.digital.pncie.com:8080/ent/okta-qa/da/api/v1/billing/summary';
      expect(HttpService.compileUrlWithParams(url, null)).toBe(url);
    });

    it('should replace two route params', function () {
      const { url, routeParams, result } = {
        url: 'https://mobile.api.dev.digital.pncie.com/ent/okta-qa/da/api/v1/policy/documents/:policyNumber/:docType',
        routeParams: { policyNumber: 'MTPU910017306', docType: 'PUP' },
        result:
          'https://mobile.api.dev.digital.pncie.com/ent/okta-qa/da/api/v1/policy/documents/MTPU910017306/PUP',
      };
      expect(HttpService.compileUrlWithParams(url, routeParams)).toBe(result);
    });

    it('should replace all route params form a url with port number', function () {
      const { url, routeParams, result } = {
        url: 'https://mobile.api.dev.digital.pncie.com:9000/ent/okta-qa/da/api/v1/policy/documents/:policyNumber/:productType/:docType',
        routeParams: { policyNumber: 'MTH3910017305', docType: 'declarations', productType: 'HO' },
        result:
          'https://mobile.api.dev.digital.pncie.com:9000/ent/okta-qa/da/api/v1/policy/documents/MTH3910017305/HO/declarations',
      };
      expect(HttpService.compileUrlWithParams(url, routeParams)).toBe(result);
    });

    it('should replace params with slash characters', function () {
      const { url, routeParams, result } = {
        url: 'https://mobile.api.dev.digital.pncie.com/ent/qa/da/api/v1/:externalURI',
        routeParams: {
          externalURI:
            '/policy/documentsecure/AAAADKdbBMaHjMJs46enrWlNQK6LeXxak5Q6mcb3vbdtIhHYywWMo8qtJnj4cfIyrTKnob47DQWrEdrYbL59da6QxiyRevvYLjMQt0tLda8DAaQ0rVLZ9w/2021-07-08T07:13:07.319792-07:00/6a3e8b53352671e427db87e5e7db685b729ccc71203f73bd87b5e71918a1a039',
        },
        result:
          'https://mobile.api.dev.digital.pncie.com/ent/qa/da/api/v1/policy/documentsecure/AAAADKdbBMaHjMJs46enrWlNQK6LeXxak5Q6mcb3vbdtIhHYywWMo8qtJnj4cfIyrTKnob47DQWrEdrYbL59da6QxiyRevvYLjMQt0tLda8DAaQ0rVLZ9w/2021-07-08T07:13:07.319792-07:00/6a3e8b53352671e427db87e5e7db685b729ccc71203f73bd87b5e71918a1a039',
      };
      expect(HttpService.compileUrlWithParams(url, routeParams)).toBe(result);
    });

    it('should replace multiple slash characters in url with single slash', function () {
      const { url, routeParams, result } = {
        url: 'https://mobile.api.dev.digital.pncie.com///ent/qa//da/api/v1/:externalURI',
        routeParams: {
          externalURI:
            '/policy//documentsecure////AAAADKdbBMaHjMJs46enrWlNQK6LeXxak5Q6mcb3vbdtIhHYywWMo8qtJnj4cfIyrTKnob47DQWrEdrYbL59da6QxiyRevvYLjMQt0tLda8DAaQ0rVLZ9w/2021-07-08T07:13:07.319792-07:00/6a3e8b53352671e427db87e5e7db685b729ccc71203f73bd87b5e71918a1a039',
        },
        result:
          'https://mobile.api.dev.digital.pncie.com/ent/qa/da/api/v1/policy/documentsecure/AAAADKdbBMaHjMJs46enrWlNQK6LeXxak5Q6mcb3vbdtIhHYywWMo8qtJnj4cfIyrTKnob47DQWrEdrYbL59da6QxiyRevvYLjMQt0tLda8DAaQ0rVLZ9w/2021-07-08T07:13:07.319792-07:00/6a3e8b53352671e427db87e5e7db685b729ccc71203f73bd87b5e71918a1a039',
      };
      expect(HttpService.compileUrlWithParams(url, routeParams)).toBe(result);
    });
  });

  describe('Native Data Serializer', function () {
    beforeEach(() => setupTestingModule(true));
    it('should use ionic-http adapter when native', function () {
      expect(service['currentAdapterTarget']).toEqual(UniHttpAdapterTarget.NATIVE);
      expect(service.client).toBeInstanceOf(IonicHttpAdapter);
    });

    it('should set data serializer to json on POST requests', async function () {
      (http.setDataSerializer as any).mockClear();
      await service.postNamedResource(AppEndpointsEnum.health, { data: 123 }).toPromise();
      expect(http.setDataSerializer).toHaveBeenCalledTimes(1);
      expect(http.setDataSerializer).toHaveBeenCalledWith('json');
    });
  });
});
