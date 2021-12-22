import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconPaymentMethodComponent } from './icon-payment-method.component';
import { PageTestingModule } from '@app/testing';

describe('IconPaymentMethodComponent', () => {
  let component: IconPaymentMethodComponent;
  let fixture: ComponentFixture<IconPaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconPaymentMethodComponent],
      imports: [PageTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
