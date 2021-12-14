import { TestBed } from '@angular/core/testing';

import { SsoService } from './sso.service';
import { AuthService } from '..';
import {
  AuthMockService,
  ConfigMockService,
  HttpMockService,
  StorageMockService,
  StoreTestBuilder,
} from '@app/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ConfigService,
  HttpService,
  RouterService,
  StorageService,
} from 'src/app/micro-apps/csaa-mobile/_core/services';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../store';
import { CsaaCoreModule } from '@csaadigital/mobile-mypolicy';
import { RouterMockService } from '../../../../testing/services/router-mock.service';

describe('SsoService', () => {
  let service: SsoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgxsModule.forRoot([AppState]), CsaaCoreModule.forRoot()],
      providers: [
        { provide: AuthService, useClass: AuthMockService },
        { provide: StorageService, useClass: StorageMockService },
        { provide: HttpService, useClass: HttpMockService },
        { provide: ConfigService, useClass: ConfigMockService },
        { provide: RouterService, useClass: RouterMockService },
      ],
    });
    const store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    service = TestBed.inject(SsoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
