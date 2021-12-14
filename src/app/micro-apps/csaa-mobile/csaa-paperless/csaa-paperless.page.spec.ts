import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsaaPolicyPaperlessPreferenceCardComponent } from './components/policy-paperless-preference-card/csaa-policy-paperless-preference-card.component';
import { CsaaPaperlessPage } from './csaa-paperless.page';
import { NgxsModule, Store } from '@ngxs/store';
import { RouterService } from '../_core/services';
import { By, PageTestingModule, StoreTestBuilder } from '@app/testing';
import { LegalService } from '../_core/services/legal.service';
import { CsaaAppInjector } from '../csaa-app.injector';
import { Injector } from '@angular/core';
import { CsaaCoreModule } from '../csaa-core/csaa-core.module';
import { AppState } from '../../../_core/store';
import { UiKitsModule } from '../_core/ui-kits/ui-kits.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IonicModule, Platform } from '@ionic/angular';
import { PaperlessPreferencesResponseBuilder } from '../../../../testing/fixtures/paperless-test.helper';
import { AccordionModule } from '../_core/ui-kits/accordion/accordion.module';
import { NotificationChannelItem, AppEndpointsEnum } from '../_core/interfaces';

describe('CsaaPaperlessPage', () => {
  let component: CsaaPaperlessPage;
  let fixture: ComponentFixture<CsaaPaperlessPage>;
  let store: Store;
  let httpTestingController: HttpTestingController;
  let paperlessResponseBuilder: PaperlessPreferencesResponseBuilder;
  const URL = `${
    AppEndpointsEnum[AppEndpointsEnum.paperlessPreferences]
  }?policyNumbers=CAAC910026006,CAH3910026008,CAPU910026011`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CsaaPaperlessPage, CsaaPolicyPaperlessPreferenceCardComponent],
      providers: [
        {
          provide: RouterService,
          useValue: {
            back: jest.fn(),
          },
        },
        { provide: LegalService, useValue: {} },
      ],
      imports: [
        CsaaCoreModule.forRoot(),
        NgxsModule.forRoot([AppState]),
        PageTestingModule.withConfig({
          providesStorage: true,
          providesRollbar: true,
          providesWebviewService: true,
          providesAnalytics: true,
          providesSso: true,
          providesPlatform: true,
        }),
        HttpClientTestingModule,
        IonicModule.forRoot(),
        UiKitsModule,
        AccordionModule,
      ],
    }).compileComponents();

    CsaaAppInjector.injector = TestBed.inject(Injector);
    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);

    httpTestingController = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(CsaaPaperlessPage);
    const platform = TestBed.inject(Platform);
    await platform.ready();

    component = fixture.componentInstance;
    fixture.detectChanges();

    paperlessResponseBuilder = PaperlessPreferencesResponseBuilder.new()
      .addPolicy('CAAC910026006')
      .addPolicy('CAH3910026008')
      .addPolicy('CAPU910026011');
  });
  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
    httpTestingController.expectOne(URL);
  });

  it('should be loading', function () {
    expect(fixture).toMatchSnapshot();
    httpTestingController.expectOne(URL);
    expect(component.loading).toBeTruthy();
  });

  it('should show "Go Paperless" card when all policies are not enabled and not pending', function () {
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#csaa-go-paperless-card'))).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should not show "Go Paperless" card when there is pending paperless enrollment', function () {
    paperlessResponseBuilder
      .forPolicy('CAAC910026006')
      .addPendingChannel(NotificationChannelItem.POLICY_DOCUMENTS);
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#csaa-go-paperless-card'))).toBeFalsy();
    expect(fixture).toMatchSnapshot();
  });

  it('should not show "Go Paperless" card when already enrolled', function () {
    paperlessResponseBuilder
      .forPolicy('CAAC910026006')
      .addEnabledChannel(NotificationChannelItem.POLICY_DOCUMENTS);
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#csaa-go-paperless-card'))).toBeFalsy();
    expect(fixture).toMatchSnapshot();
  });

  it('should render Text Alerts on', function () {
    paperlessResponseBuilder.forPolicy('CAAC910026006').enableSms('1234561234');
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render Policy Documents enrolled by Email', function () {
    paperlessResponseBuilder
      .forPolicy('CAAC910026006')
      .addEnabledChannel(NotificationChannelItem.POLICY_DOCUMENTS);
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render Billing & Payment : Bill Notification and Payment Reminder enrolled by Email', function () {
    paperlessResponseBuilder
      .forPolicy('CAAC910026006')
      .addEnabledChannel(NotificationChannelItem.BILL_NOTIFICATION)
      .addEnabledChannel(NotificationChannelItem.PAYMENT_REMINDER);
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render Billing & Payment : Bill Notification and Payment Confirmation enrolled by Email', function () {
    paperlessResponseBuilder
      .forPolicy('CAAC910026006')
      .addEnabledChannel(NotificationChannelItem.BILL_NOTIFICATION)
      .addEnabledChannel(NotificationChannelItem.PAYMENT_CONFIRMATION);
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render Billing & Payment : Bill Notification, Payment Reminder and Payment Confirmation enrolled by Email', function () {
    paperlessResponseBuilder
      .forPolicy('CAAC910026006')
      .addEnabledChannel(NotificationChannelItem.BILL_NOTIFICATION)
      .addEnabledChannel(NotificationChannelItem.PAYMENT_REMINDER)
      .addEnabledChannel(NotificationChannelItem.PAYMENT_CONFIRMATION);
    httpTestingController.expectOne(URL).flush(paperlessResponseBuilder.getResponse());
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
