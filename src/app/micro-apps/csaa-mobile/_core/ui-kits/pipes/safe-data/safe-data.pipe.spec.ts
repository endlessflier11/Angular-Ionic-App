import { SafeDataPipe } from './safe-data.pipe';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafeDataPipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({
      providers: [DomSanitizer],
    });
    const pipe = new SafeDataPipe(TestBed.inject(DomSanitizer));
    expect(pipe).toBeTruthy();
  });
});
