import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { CsaaPaymentsUiKitsModule } from '../../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { CsaaPoiIndexPage } from './poi-index.page';
import { CsaaTheme } from '../../_core/services/config/config.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaCoveragesUiKitsModule } from '../../csaa-coverages/_shared/ui-kits/csaa-coverages-ui-kits.module';
import { IonicStorageModule } from '@ionic/storage';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { AnalyticsService } from '../../_core/services';
import { Category, EventName } from '../../_core/interfaces';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../_core/store';
import { Platform } from '@ionic/angular';

describe('CsaaPoiIndexPage', () => {
  let component: CsaaPoiIndexPage;
  let fixture: ComponentFixture<CsaaPoiIndexPage>;
  let analyticService: AnalyticsService;
  let store: Store;
  beforeEach(async () => {
    const PARAM_MAP = new Map();
    //    PARAM_MAP.set('policyNumber', 'WYSS910014010');
    PARAM_MAP.set('policyNumber', 'CAAC910026006');

    try {
      await TestBed.configureTestingModule({
        declarations: [CsaaPoiIndexPage],
        imports: [
          IonicStorageModule.forRoot(),
          PageTestingModule.withConfig({
            providesConfig: true,
            providesAnalytics: true,
            providesRollbar: true,
            providesRouter: true,
            providesStorage: true,
          }),
          UiKitsModule,
          CsaaPaymentsUiKitsModule,
          CsaaCoveragesUiKitsModule,
          NgxsModule.forRoot([AppState]),
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              paramMap: of(PARAM_MAP),
            },
          },
        ],
      }).compileComponents();

      store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      CsaaAppInjector.injector = TestBed.inject(Injector);
      analyticService = TestBed.inject(AnalyticsService);
      fixture = TestBed.createComponent(CsaaPoiIndexPage);
      component = fixture.componentInstance;
      component.currentTheme = CsaaTheme.ACA;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot with selected vehicle id card', () => {
    component.selectedIdCardIndex = 0;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should track home page when clicking on backButton', () => {
    try {
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
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  // Todo: test that apple wallet btn is shown
  // - click sends the user to the system browser
  // - download selected event is tracked
});
