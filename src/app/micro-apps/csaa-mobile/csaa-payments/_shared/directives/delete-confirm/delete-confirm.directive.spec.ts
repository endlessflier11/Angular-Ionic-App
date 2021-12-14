import { DeleteConfirmDirective } from './delete-confirm.directive';
import { TestBed } from '@angular/core/testing';
import { PageTestingModule } from '@app/testing';
import { CommonModule } from '@angular/common';

describe('DeleteConfirmDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      imports: [PageTestingModule.withConfig({ providesAlert: true }), CommonModule],
      declarations: [DeleteConfirmDirective],
      providers: [
        DeleteConfirmDirective,
        // { provide: AlertController, useClass: AlertControllerMock },
      ],
    });
    const directive = TestBed.inject(DeleteConfirmDirective);
    expect(directive).toBeTruthy();
  });
});
