import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { PageTestingModule } from '@app/testing';
import { HttpBackend } from '@angular/common/http';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({ providesStorage: true, providesRouter: true }),
        CsaaCoreModule.forRoot(),
      ],
      providers: [HttpBackend],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
