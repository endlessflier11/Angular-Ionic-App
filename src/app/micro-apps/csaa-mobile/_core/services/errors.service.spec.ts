import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ErrorService } from './errors.service';
import spyOn = jest.spyOn;

describe('error service', () => {
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        {
          provide: HttpTestingController,
          useValue: jest.fn(),
        },
      ],
    });
    errorService = TestBed.inject(ErrorService);
  });

  it('should publish error', () => {
    const nextSpy = spyOn(errorService.errorSubject$, 'next');
    errorService.publishError('error');
    expect(nextSpy).toHaveBeenCalled();
  });

  it('should get errors', () => {
    errorService.getErrors().subscribe((error) => {
      expect(error).toEqual(errorService.errorSubject$);
    });
  });
});
