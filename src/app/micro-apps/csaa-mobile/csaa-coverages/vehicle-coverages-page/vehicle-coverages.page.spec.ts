/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { CallService } from '../../_core/services/call.service';
import { CustomErrorHandler } from '../../_core/shared/custom-error-handler';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaVehicleCoveragesPage } from './vehicle-coverages.page';

import { CsaaCoveragesUiKitsModule } from '../_shared/ui-kits/csaa-coverages-ui-kits.module';
import { ActivatedRoute } from '@angular/router';

import { GlobalStateService } from '../../_core/services';
import {
  AUTH_STATE_FIXTURE_MOCK,
  CONFIG_STATE_FIXTURE_MOCK,
  CONTACT_INFO_STATE_FIXTURE_MOCK,
  CustomerResponseMock,
  PageTestingModule,
  PoliciesResponseMock,
} from '../../../../../testing';
import { AppEndpointsEnum } from '../../_core/interfaces';
import { HttpTestingController } from '@angular/common/http/testing';
import { Store } from '@ngxs/store';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { trackRequest } from '../../_core/operators/track-request.operator';
import { ContactInfoAction } from '../../_core/store/actions/contact-info.actions';

const flushMockResponses = (
  httpTestingController: HttpTestingController,
  MOCK: { customer: any; policies: any }
) => {
  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.customerSearch])
    .forEach((req) => req.flush(MOCK.customer.toJson()));

  httpTestingController
    .match(AppEndpointsEnum[AppEndpointsEnum.policies])
    .forEach((req) => req.flush(MOCK.policies.toJson()));
};

describe('CsaaVehicleCoveragesPage', () => {
  let MOCK: { customer: any; policies: any };
  let component: CsaaVehicleCoveragesPage;
  let fixture: ComponentFixture<CsaaVehicleCoveragesPage>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    MOCK = {
      customer: CustomerResponseMock.create(),
      policies: PoliciesResponseMock.create(),
    };

    const [DBPolicyRef] = MOCK.policies.toJson();
    const [DBVehicleRef] = DBPolicyRef.vehicles;
    const PARAM_MAP = new Map();
    PARAM_MAP.set('policyNumber', DBPolicyRef.policyNumber);
    PARAM_MAP.set('vehicleId', DBVehicleRef.vehicleIdentifier);
    try {
      TestBed.configureTestingModule({
        declarations: [CsaaVehicleCoveragesPage],
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
        imports: [
          IonicModule,
          UiKitsModule,
          CsaaCoveragesUiKitsModule,
          PageTestingModule.withConfig({
            providesStorage: true,
            providesPlatform: true,
            providesConfig: true,
            providesRouter: true,
            providesAnalytics: true,
          }),
        ],
      }).compileComponents();

      const store = TestBed.inject(Store);
      store.reset({
        csaa_app: {
          ...store.snapshot().csaa_app,
          csaa_config: CONFIG_STATE_FIXTURE_MOCK,
          csaa_auth: AUTH_STATE_FIXTURE_MOCK,
          csaa_contactInfo: CONTACT_INFO_STATE_FIXTURE_MOCK,
        },
      });

      CsaaAppInjector.injector = TestBed.inject(Injector);
      httpTestingController = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(CsaaVehicleCoveragesPage);
      component = fixture.componentInstance;

      // Todo: A more elegant way to set fetch status to true without api call
      of(null).pipe(trackRequest(ContactInfoAction.LoadContacts)).subscribe();
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
    component.ionViewWillEnter();
    flushMockResponses(httpTestingController, MOCK);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
