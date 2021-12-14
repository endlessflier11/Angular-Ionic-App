/* eslint-disable no-underscore-dangle,@typescript-eslint/naming-convention */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import {
  AuthMockService,
  AUTH_STATE_FIXTURE_MOCK,
  CONFIG_STATE_FIXTURE_MOCK,
  METADATA_STATE_FIXTURE_MOCK,
  PageTestingModule,
} from '../../../testing';
import { AuthService } from '../../_core/services';

import { AcaHomePagePage } from './aca-home-page.page';

describe('AcaHomePagePage', () => {
  let component: AcaHomePagePage;
  let fixture: ComponentFixture<AcaHomePagePage>;
  let authMockService: AuthMockService;

  beforeEach(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [AcaHomePagePage],
        imports: [
          IonicModule.forRoot(),
          RouterTestingModule,
          PageTestingModule.withConfig({ providesStorage: true }),
        ],
        providers: [
          {
            provide: NavController,
            useValue: {
              navigateForward: jest.fn().mockReturnValue(Promise.resolve(null)),
            },
          },
          { provide: AuthService, useClass: AuthMockService },
        ],
      }).compileComponents();
      const store = TestBed.inject(Store);
      store.reset({
        __csaa_app: {
          ...store.snapshot().__csaa_app,
          config: CONFIG_STATE_FIXTURE_MOCK,
          metadata: METADATA_STATE_FIXTURE_MOCK,
          auth: AUTH_STATE_FIXTURE_MOCK,
        },
      });

      authMockService = TestBed.inject(AuthService) as any;
      authMockService.fakeLogin();

      fixture = TestBed.createComponent(AcaHomePagePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.log(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
