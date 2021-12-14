import { TestBed } from '@angular/core/testing';
import { HttpBackend } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { RouterService } from './router.service';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { PageTestingModule } from '@app/testing';

describe('RouterService', () => {
  let service: RouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PageTestingModule.withConfig({ providesAnalytics: true, providesStorage: true }),
        RouterTestingModule,
        CsaaCoreModule.forRoot(),
      ],
      providers: [HttpBackend],
    });
    service = TestBed.inject(RouterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
