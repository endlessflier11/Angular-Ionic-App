import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NoActivePoliciesCardComponent } from './no-active-policies-card.component';

describe('NoActivePoliciesCardComponent', () => {
  let component: NoActivePoliciesCardComponent;
  let fixture: ComponentFixture<NoActivePoliciesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NoActivePoliciesCardComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(NoActivePoliciesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
