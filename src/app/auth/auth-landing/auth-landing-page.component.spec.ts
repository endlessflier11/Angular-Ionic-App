import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLandingPage } from './auth-landing-page.component';
import { PageTestingModule } from '@app/testing';

describe('AuthLandingPage', () => {
  let component: AuthLandingPage;
  let fixture: ComponentFixture<AuthLandingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthLandingPage],
      imports: [PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true })],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });
});
