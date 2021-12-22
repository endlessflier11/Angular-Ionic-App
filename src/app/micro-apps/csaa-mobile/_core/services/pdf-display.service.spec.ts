/* eslint-disable max-len */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AlertMock,
  CUSTOMER_STATE_FIXTURE_MOCK,
  DOCUMENTS_FIXTURE,
  PageTestingModule,
  setPolicyDocuments,
  StoreTestBuilder,
} from '@app/testing';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { PdfDisplayService } from './pdf-display.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../_core/store';
import { FileDownloadService } from './file-download.service';
import { of } from 'rxjs/internal/observable/of';

jest.mock('@capacitor/share', () => ({
  Share: { share: jest.fn() },
  ShareOptions: {},
  ShareResult: {},
}));
import { AnalyticsService } from './analytics.service';
import { PolicyState } from '../store/states/policy.state';
import { CallbackDataSelection } from '../ui-kits/document-action-modal/document-action-modal.component';
import { ErrorWithReporter } from '../helpers';
import { Category, EventName } from '../interfaces';
import { AlertController } from '@ionic/angular';
import { UniHttpErrorResponse } from './http/uni-http.model';

describe('Pdf Display Service', () => {
  let service: PdfDisplayService;
  let store: Store;
  let POLICY_NUMBER;
  let INITIAL_POLICES;
  const consoleLog = global.console.log;

  beforeEach(() => {
    INITIAL_POLICES = CUSTOMER_STATE_FIXTURE_MOCK.csaa_policies.policies;
    POLICY_NUMBER = INITIAL_POLICES[0].number;

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxsModule.forRoot([AppState]),
        PageTestingModule.withConfig({
          providesAnalytics: true,
          providesHttp: true,
          providesWebviewService: true,
          providesPlatform: true,
          providesModal: true,
          providesAlert: true,
          providesStorage: true,
          providesRollbar: true,
        }),
      ],
      providers: [
        PdfDisplayService,
        { provide: FileOpener, useValue: { open: jest.fn() } },
        {
          provide: FileDownloadService,
          useValue: {
            download: jest.fn().mockImplementation((_, fileName) => of(`/path/to/${fileName}`)),
          },
        },
      ],
    });

    CsaaAppInjector.injector = TestBed.inject(Injector);
    service = TestBed.inject(PdfDisplayService);
    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks()
      .withCustomerState(
        setPolicyDocuments(CUSTOMER_STATE_FIXTURE_MOCK, DOCUMENTS_FIXTURE, POLICY_NUMBER)
      )
      .resetStateOf(store);

    global.console.log = jest.fn();
  });
  afterEach(() => (global.console.log = consoleLog));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('onActionFailed', function () {
    let policy;
    let policyDocument;
    let analyticsService;
    let error;
    let result;
    const GENERIC_MESSAGE = 'GENERIC ERROR MESSAGE';

    beforeEach(() => {
      analyticsService = TestBed.inject(AnalyticsService);
      policy = store.selectSnapshot(PolicyState.policyData(POLICY_NUMBER));
      policyDocument = store.selectSnapshot(PolicyState.documentsForPolicy(POLICY_NUMBER))[0];
      result = {
        selection: CallbackDataSelection.save,
        completed: false,
        error: new Error(GENERIC_MESSAGE),
      };
      error = new ErrorWithReporter(result);
    });

    it('should track Analytics Error', function () {
      service.onActionFailed(policy, policyDocument, error);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        EventName.ERROR_NOTIFICATION,
        Category.documents,
        {
          document_category: 'Policy Documents',
          document_effective: 'current',
          document_name: 'Property Declaration Page',
          document_type: 'Declarations Page',
          event_type: 'Messaged',
          policies: [
            {
              policy_number: 'CAAC910026006',
              policy_state: 'CA',
              policy_type: 'Auto',
            },
          ],
          process_date: '2020-09-08',
          selection: 'Property Declaration Page',
        }
      );
    });

    it('should send error to Rollbar', function () {
      error.report = jest.fn();
      service.onActionFailed(policy, policyDocument, error);
      expect(error.report).toHaveBeenCalled();
    });

    it('should show an error dialog', function () {
      // global.console.log = consoleLog;
      service.onActionFailed(policy, policyDocument, error);
      const alertControllerMock = TestBed.inject(AlertController);
      expect(alertControllerMock.create).toHaveBeenCalled();
      const alert = alertControllerMock.getTop() as any as AlertMock;
      expect(alert).toBeDefined();
      expect(alert.getOptions()).toEqual({
        header: 'Unable to load document',
        message:
          'Oops! An error occurred when trying to load your document. Please try again. If the issue persists, please give us a call.',
        buttons: ['Close'],
      });
    });

    it('should show a Connection Failed error dialog on HttpError', function () {
      error = new ErrorWithReporter(
        new UniHttpErrorResponse({
          status: 500,
          statusText: 'Internal Server Error',
          isNetworkError: true,
          error,
          message: `HTTP ${GENERIC_MESSAGE}`,
          url: 'http://localhost/123',
        })
      );
      service.onActionFailed(policy, policyDocument, error);
      const alertControllerMock = TestBed.inject(AlertController);
      expect(alertControllerMock.create).toHaveBeenCalled();
      const alert = alertControllerMock.getTop() as any as AlertMock;
      expect(alert).toBeDefined();
      expect(alert.getOptions()).toEqual({
        header: 'Connection Failed',
        message:
          'We were unable to load the requested document at this time. Please check your connection and try again.',
        buttons: ['Close'],
      });
    });

    it('should show a Sharing failed error dialog', function () {
      result = {
        selection: CallbackDataSelection.share,
        completed: false,
        error: new Error(GENERIC_MESSAGE),
      };
      error = new ErrorWithReporter(result);

      service.onActionFailed(policy, policyDocument, error);
      const alertControllerMock = TestBed.inject(AlertController);
      expect(alertControllerMock.create).toHaveBeenCalled();
      const alert = alertControllerMock.getTop() as any as AlertMock;
      expect(alert).toBeDefined();
      expect(alert.getOptions()).toEqual({
        header: 'Sharing failed',
        message: GENERIC_MESSAGE,
        buttons: ['Close'],
      });
    });
    it('should NOT show a Sharing failed error dialog when user cancelled', function () {
      result = {
        selection: CallbackDataSelection.share,
        completed: false,
        error: new Error('Share canceled'),
      };
      error = new ErrorWithReporter(result);

      service.onActionFailed(policy, policyDocument, error);
      const alertControllerMock = TestBed.inject(AlertController);
      expect(alertControllerMock.create).not.toHaveBeenCalled();
      expect(alertControllerMock.getTop()).toBeUndefined();
    });
  });
});
