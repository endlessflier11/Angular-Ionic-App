import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGroupPaymentMethodComponent } from './card-group-payment-method.component';
import { PageTestingModule } from '@app/testing';

describe('CardGroupPaymentMethodComponent', () => {
  let component: CardGroupPaymentMethodComponent;
  let fixture: ComponentFixture<CardGroupPaymentMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardGroupPaymentMethodComponent],
      imports: [PageTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardGroupPaymentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
