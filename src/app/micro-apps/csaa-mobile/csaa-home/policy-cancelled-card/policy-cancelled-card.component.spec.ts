import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PageTestingModule } from '../../../../../testing';
import { Policy, PolicyStatus, PolicyType } from '../../_core/interfaces/policy.interface';
import { ThemeIconComponent } from '../../_core/ui-kits/theme-icon/theme-icon.component';

import { PolicyCancelledCardComponent } from './policy-cancelled-card.component';

describe('PolicyCancelledCardComponent', () => {
  let component: PolicyCancelledCardComponent;
  let fixture: ComponentFixture<PolicyCancelledCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyCancelledCardComponent, ThemeIconComponent],
      imports: [PageTestingModule.withConfig({ providesConfig: true }), IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyCancelledCardComponent);
    component = fixture.componentInstance;

    component.policy = {
      id: 'test',
      number: 'test',
      status: PolicyStatus.CANCELLED,
      vehicles: [],
      type: PolicyType.Home,
    } as Policy;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
