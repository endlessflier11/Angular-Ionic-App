import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { CallService } from '../../_core/services/call.service';
import { CustomErrorHandler } from '../../_core/shared/custom-error-handler';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaVehicleCoveragesPage } from '../vehicle-coverages-page/vehicle-coverages.page';

import { CsaaCoveragesIndexPage } from './coverages-index.page';
import { CsaaCoveragesUiKitsModule } from '../_shared/ui-kits/csaa-coverages-ui-kits.module';
import { ActivatedRoute } from '@angular/router';

import { GlobalStateService } from '../../_core/services';
import { By, clickEvent, PageTestingModule, StoreTestBuilder } from '../../../../../testing';
import { Category, EventName } from '../../_core/interfaces';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { NgxsModule, Store } from '@ngxs/store';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppState } from '../../../../_core/store';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';

describe('CsaaCoveragesIndexPage', () => {
  let component: CsaaCoveragesIndexPage;
  let fixture: ComponentFixture<CsaaCoveragesIndexPage>;
  let analyticService;

  beforeEach(async () => {
    const PARAM_MAP = new Map();
    PARAM_MAP.set('policyNumber', 'CAAC910026006'); // !important - must be one of the polices in the PolicyState
    PARAM_MAP.set('policyType', '2');
    await TestBed.configureTestingModule({
      declarations: [CsaaCoveragesIndexPage, CsaaVehicleCoveragesPage],
      imports: [
        IonicModule,
        UiKitsModule,
        CsaaCoveragesUiKitsModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesHttp: true,
          providesPlatform: true,
          providesRouter: true,
          providesConfig: true,
          providesAnalytics: true,
        }),
        HttpClientTestingModule,
        NgxsModule.forRoot([AppState]),
        CsaaCoreModule.forRoot(),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(PARAM_MAP),
          },
        },
        { provide: NavController, useValue: { push: jest.fn() } },
        {
          provide: CallService,
          useValue: {
            call: jest.fn(),
            getServiceNumber: jest.fn(() => '12345'),
            getEmergencyNumber: jest.fn(() => '45678'),
            getClaimsNumber: jest.fn(() => '1234'),
          },
        },
        { provide: CustomErrorHandler, useValue: { handleError: jest.fn() } },
        {
          provide: PolicyDocumentHelper,
          useValue: {
            openDocument: jest.fn(),
          },
        },
        {
          provide: GlobalStateService,
          useValue: {
            getIsStandalone: jest.fn(() => false),
            getRegistrationId: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    const store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);

    CsaaAppInjector.injector = TestBed.inject(Injector);
    analyticService = TestBed.inject(AnalyticsService);
    fixture = TestBed.createComponent(CsaaCoveragesIndexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    component.ngOnInit();
    component.ionViewWillEnter();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should track the view declarations button click', fakeAsync(() => {
    component.ngOnInit();
    component.ionViewWillEnter();

    component.viewDeclaration();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.VIEW_DECLARATIONS,
      Category.coverages,
      {
        event_type: 'File Downloaded',
        file: 'Declaration',
      }
    );
  }));

  it('should track call service clicked', () => {
    const callBtn = fixture.debugElement.query(
      By.cssAndText('csaa-working-hours ion-button', 'Call Service')
    );
    callBtn.triggerEventHandler('click', clickEvent);
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.CONTACT_INITIATED,
      Category.global,
      {
        event_type: 'Option Selected',
        method: 'phone',
        selection: 'Call Service',
      }
    );
  });

  it('should track Home Accessed after  back button click', () => {
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

  it('should track agent contact', () => {
    component.onAgentContact('phone');
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.CONTACT_INITIATED,
      Category.coverages,
      {
        event_type: 'Option Selected',
        method: 'phone',
        selection: 'Call Service',
      }
    );
  });
});
