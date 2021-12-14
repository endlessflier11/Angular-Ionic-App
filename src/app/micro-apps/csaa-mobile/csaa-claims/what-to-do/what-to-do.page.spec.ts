import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { IonicModule, Platform } from '@ionic/angular';
import { of } from 'rxjs';
import { Category, EventName } from '../../_core/interfaces';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { CameraService } from '../../_core/services/camera.service';
import { RouterService } from '../../_core/services/router/router.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaClaimsUiKitsModule } from '../_shared/ui-kits/csaa-claims-ui-kits.module';

import { WhatToDoPage } from './what-to-do.page';
import { Store } from '@ngxs/store';

describe('WhatToDoPage', () => {
  let component: WhatToDoPage;
  let fixture: ComponentFixture<WhatToDoPage>;
  let analyticService: AnalyticsService;
  let routerServiceMock: jest.Mocked<RouterService>;
  const PARAM_MAP = new Map();
  PARAM_MAP.set('policyType', '2');

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [WhatToDoPage],
        providers: [
          { provide: CallService, useValue: { call: jest.fn() } },
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: of(PARAM_MAP),
            },
          },
          {
            provide: CameraService,
            useValue: {
              getPicture: jest.fn().mockReturnValue(Promise.resolve(null)),
            },
          },
        ],
        imports: [
          IonicModule,
          UiKitsModule,
          CsaaClaimsUiKitsModule,
          PageTestingModule.withConfig({
            providesStorage: true,
            providesConfig: true,
            providesPlatform: true,
            providesAnalytics: true,
            providesAlert: true,
            providesRouter: true,
          }),
        ],
      }).compileComponents();

      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      analyticService = TestBed.inject(AnalyticsService);
      routerServiceMock = TestBed.inject(RouterService) as any;
      fixture = TestBed.createComponent(WhatToDoPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track Home Accessed after back button click when home was the previous route', () => {
    routerServiceMock.previousRouteIs.mockReturnValue(true);
    component.backButtonClick();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.HOME_ACCESSED,
      Category.global,
      {
        event_type: 'Link Accessed',
        link: 'Home',
      }
    );
    expect(analyticService.trackEvent).toHaveBeenCalledTimes(1);
  });

  it('should NOT track Home Accessed after back button click when home was not the previous route', () => {
    routerServiceMock.previousRouteIs.mockReturnValue(false);
    component.backButtonClick();
    expect(analyticService.trackEvent).not.toHaveBeenCalled();
  });

  it('should track the open camera button', () => {
    component.openCamera();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.CAMERA_ACCESSED,
      Category.claims,
      {
        event_type: 'Link Accessed',
        selection: 'Camera',
      }
    );
  });

  it('should track call claims', () => {
    component.callClaims();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.CONTACT_INITIATED,
      Category.claims,
      {
        event_type: 'Option Selected',
        method: 'phone',
        selection: 'Contact Claims',
      }
    );
  });

  it('should track call 911', () => {
    component.call911();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.CONTACT_INITIATED,
      Category.claims,
      {
        event_type: 'Option Selected',
        method: 'phone',
        selection: 'Call 911',
      }
    );
  });
});
