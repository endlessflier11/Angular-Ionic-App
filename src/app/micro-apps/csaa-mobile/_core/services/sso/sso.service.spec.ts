import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SsoService } from './sso.service';
import {
  AuthMockService,
  PageTestingModule,
  PlatformMockService,
  StoreTestBuilder,
} from '@app/testing';
import { AuthService } from '../auth/auth.service';
import {
  WebDeeplinkInitializationResponse,
  WebDeeplinkLocation,
} from '../../interfaces/auth.interface';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../platform.service';
import { HTTP_TRANSLATOR_SERVICE_TIMEOUT } from '../../../constants';

describe('SsoService', () => {
  let service: SsoService;
  let platformService: PlatformMockService;
  let authMockService: AuthMockService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({
          providesRouter: true,
          providesAuth: true,
          providesStorage: true,
          providesConfig: true,
          providesPlatform: true,
        }),
        HttpClientTestingModule,
        CsaaHttpClientModule,
        CsaaCoreModule.forRoot(),
        NgxsModule.forRoot([AppState]),
      ],
      providers: [{ provide: PlatformService, useClass: PlatformMockService }],
    });

    const store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    // await TestBed.inject(Platform).ready();
    platformService = TestBed.inject(PlatformService) as any;

    service = TestBed.inject(SsoService);
    httpTestingController = TestBed.inject(HttpTestingController);
    authMockService = TestBed.inject(AuthService) as any;
    authMockService.fakeLogin();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe.each([
    WebDeeplinkLocation.DASHBOARD,
    WebDeeplinkLocation.CLAIMS,
    WebDeeplinkLocation.TRANSACTIONS,
  ])('Deeplink', (location) => {
    afterEach(() => httpTestingController.verify());

    it(
      'should be generated for ' + location,
      fakeAsync(() => {
        const responseBody: WebDeeplinkInitializationResponse = {
          tempToken: 'temp-token',
          expiresIn: 30,
        };
        const next = jest.fn().mockImplementation((link: string) => {
          expect(link).toEqual(
            `mobileTranslatorServiceDeepLink/${responseBody.tempToken}/${location}`
          );
        });
        service.generateWebDeeplink(location).subscribe(next, console.error);

        const req = httpTestingController.match('/translator/tempToken').pop();
        expect(req).toBeTruthy();
        expect(req.request.method).toEqual('POST');

        req.flush(responseBody);
        tick();
        expect(next).toHaveBeenCalled();
      })
    );
  });

  it('should throw timeout error', fakeAsync(() => {
    const next = jest.fn().mockImplementation(() => {
      fail('Call to Translator Service should have timed out.');
    });
    const error = jest.fn().mockImplementation((errorResponse: HttpErrorResponse) => {
      expect(errorResponse).toBeTruthy();
      expect(errorResponse.status).toEqual(504);
    });
    platformService.setIsNative(true);
    service.callTranslatorService({ accessToken: '123' }).subscribe(next, error);
    tick(HTTP_TRANSLATOR_SERVICE_TIMEOUT);

    const req = httpTestingController.match('mobileTranslatorService').pop();
    expect(req).toBeTruthy();
    expect(req.request.method).toEqual('POST');
    expect(req.cancelled).toBeTruthy();
    tick();
    expect(next).not.toHaveBeenCalled();
  }));
});
