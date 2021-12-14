import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoLoginPage } from './sso-login.page';
import { AuthMockService, PageTestingModule, SsoMockService } from '@app/testing';
import { AuthService, SsoService } from '../../_core/services';
import { UiKitsModule } from '../../micro-apps/csaa-mobile/_core/ui-kits/ui-kits.module';

describe('SsoLoginPage', () => {
  let component: SsoLoginPage;
  let fixture: ComponentFixture<SsoLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SsoLoginPage],
      imports: [PageTestingModule.withConfig({ providesStorage: true }), UiKitsModule],
      providers: [
        { provide: AuthService, useClass: AuthMockService },
        { provide: SsoService, useClass: SsoMockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SsoLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.skip('should match snapshot', async () => {
    await fixture.whenStable();
    expect(fixture).toMatchSnapshot();
  });
});
