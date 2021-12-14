import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { of } from 'rxjs';
import { Category, EventName } from '../../_core/interfaces';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaClaimsUiKitsModule } from '../_shared/ui-kits/csaa-claims-ui-kits.module';

import { ClaimsDetailPage } from './claims-detail.page';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { HttpTestingController } from '@angular/common/http/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../_core/store';

describe('ClaimsDeatilPage', () => {
  let component: ClaimsDetailPage;
  let fixture: ComponentFixture<ClaimsDetailPage>;
  let analyticService;
  let httpTestingController;
  let store: Store;
  const PARAM_MAP = new Map();
  PARAM_MAP.set('claimNumber', '1003-91-0166');

  beforeEach(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [ClaimsDetailPage],
        providers: [
          { provide: CallService, useValue: { call: jest.fn() } },
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: of(PARAM_MAP),
            },
          },
        ],
        imports: [
          IonicModule,
          IonicStorageModule.forRoot(),
          UiKitsModule,
          CsaaClaimsUiKitsModule,
          PageTestingModule.withConfig({
            providesPlatform: true,
            providesStorage: true,
            providesAnalytics: true,
            providesConfig: true,
            providesRouter: true,
          }),
          NgxsModule.forRoot([AppState]),
        ],
      }).compileComponents();
      store = TestBed.inject(Store);
      new StoreTestBuilder().withDefaultMocks().resetStateOf(store);

      CsaaAppInjector.injector = TestBed.inject(Injector);
      analyticService = TestBed.inject(AnalyticsService);
      httpTestingController = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(ClaimsDetailPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should track home page when clicking on backButton', async () => {
    try {
      fixture.detectChanges();
      await component.backButtonClick();
      expect(analyticService.trackEvent).toHaveBeenCalledWith(
        EventName.HOME_ACCESSED,
        Category.global,
        {
          event_type: 'Link Accessed',
          link: 'Home',
        }
      );
      expect(analyticService.trackEvent).toHaveBeenCalledTimes(1);
    } catch (error) {
      console.error(error.message);
      fail(error.message);
    }
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

  it('should not fail if state is null', () => {
    expect(component).toBeTruthy();
    const state = store.snapshot();
    state.csaa_app.csaa_customer.csaa_claims = null;
    store.reset(state);
    expect(fixture).toMatchSnapshot();
  });
});
