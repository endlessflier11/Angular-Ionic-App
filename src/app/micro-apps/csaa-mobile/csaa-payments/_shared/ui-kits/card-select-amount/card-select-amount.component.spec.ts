import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSelectAmountComponent } from './card-select-amount.component';
import { PageTestingModule } from '@app/testing';

describe('CardSelectAmountComponent', () => {
  let component: CardSelectAmountComponent;
  let fixture: ComponentFixture<CardSelectAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardSelectAmountComponent],
      imports: [PageTestingModule.withConfig({ providesPlatform: true })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardSelectAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
