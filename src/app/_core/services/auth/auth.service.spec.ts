import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { StorageMockService } from '@app/testing';
import { AuthService as CsaaAuthService } from '@csaadigital/mobile-mypolicy';
import { StorageService } from '@csaadigital/mobile-mypolicy';
import { RouterService } from '../../../micro-apps/csaa-mobile/_core/services';
import { RouterMockService } from '../../../../testing/services/router-mock.service';

const mockedCsaaAuthService = {};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: StorageMockService },
        { provide: CsaaAuthService, useValue: mockedCsaaAuthService },
        { provide: RouterService, useClass: RouterMockService },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
