import { TestBed } from '@angular/core/testing';
import { HttpBackend } from '@angular/common/http';

import { ConfigService } from './config.service';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { StorageService } from '../storage/storage.service';
import { StorageMockService } from '@app/testing';
import { RouterService } from '../router/router.service';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CsaaCoreModule.forRoot()],
      providers: [
        HttpBackend,
        { provide: StorageService, useClass: StorageMockService },
        { provide: RouterService, useClass: RouterMockService },
      ],
    });
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
