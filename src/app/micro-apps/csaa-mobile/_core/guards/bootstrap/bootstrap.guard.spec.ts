/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import {
  AuthMockService,
  ConfigMockService,
  CONFIG_STATE_FIXTURE_MOCK,
  METADATA_STATE_FIXTURE_MOCK,
  StorageMock,
  StorageMockService,
  WebviewMockService,
} from '../../../../../../testing';
import { AppState } from '../../../../../_core/store';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';
import { AuthService, ConfigService, StorageService, WebviewService } from '../../services';

import { BootstrapGuard } from './bootstrap.guard';
import { RouterTestingModule } from '@angular/router/testing';

describe('BootstrapGuard', () => {
  let guard: BootstrapGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CsaaHttpClientModule,
        CsaaCoreModule.forRoot(),
        NgxsModule.forRoot([AppState]),
      ],
      providers: [
        BootstrapGuard,
        { provide: AuthService, useClass: AuthMockService },
        { provide: Storage, useClass: StorageMock },
        { provide: StorageService, useClass: StorageMockService },
        { provide: ConfigService, useClass: ConfigMockService },
        { provide: WebviewService, useClass: WebviewMockService },
      ],
    });

    const store = TestBed.inject(Store);
    store.reset({
      __csaa_app: {
        ...store.snapshot().__csaa_app,
        config: CONFIG_STATE_FIXTURE_MOCK,
        metadata: METADATA_STATE_FIXTURE_MOCK,
      },
    });

    guard = TestBed.inject(BootstrapGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
