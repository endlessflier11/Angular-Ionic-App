import { TestBed } from '@angular/core/testing';

import { GuestGuard } from './guest.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthMockService, StorageMock } from '@app/testing';
import { AuthService } from '../services';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CsaaCoreModule, CsaaHttpClientModule } from '@csaadigital/mobile-mypolicy';
import { Storage } from '@ionic/storage';
import { CsaaStoreModule } from '../../micro-apps/csaa-mobile/_core/store/csaa-store.module';

describe('GuestGuard', () => {
  let guard: GuestGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        CsaaHttpClientModule,
        CsaaCoreModule.forRoot(),
        CsaaStoreModule,
      ],
      providers: [
        { provide: AuthService, useClass: AuthMockService },
        { provide: Storage, useClass: StorageMock },
      ],
    });
    guard = TestBed.inject(GuestGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
