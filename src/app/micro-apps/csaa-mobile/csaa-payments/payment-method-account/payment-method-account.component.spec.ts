import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';

import { PaymentMethodAccountPage } from './payment-method-account.page';
import { PageTestingModule } from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalStateService } from '../../_core/services/global-state.service';
import { CallService } from '../../_core/services/call.service';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { PaymentService } from '../../_core/services/payment.service';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { of } from 'rxjs';
import { PolicyService } from '../../_core/services/policy.service';
import { ActivatedRoute } from '@angular/router';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { CsaaPaymentDirectivesModule } from '../_shared/directives/csaa-payment-directives.module';
import { Category, EventName } from '../../_core/interfaces/analytics.interface';

try {
  describe('PaymentMethodAccountPage', () => {
    let component: PaymentMethodAccountPage;
    let fixture: ComponentFixture<PaymentMethodAccountPage>;
    let analyticService;
    const PARAM_MAP = new Map();
    PARAM_MAP.set('account', '1234');

    beforeEach(async(() => {
      try {
        TestBed.configureTestingModule({
          declarations: [PaymentMethodAccountPage],
          providers: [
            {
              provide: ActivatedRoute,
              useValue: {
                params: of({ autoPay: false, policyNumber: '12345' }),
                paramMap: of(PARAM_MAP),
                queryParams: of(PARAM_MAP),
              },
            },
            {
              provide: PolicyService,
              useValue: {
                getInsuredFirstName: jest.fn(),
                refreshPolicies: jest.fn(),
                listPolicies: jest.fn(),
                cleanUpPoliciesSubscriptions: jest.fn(),
                customerSearch: jest.fn().mockReturnValue(of({})),
              },
            },
            {
              provide: PaymentService,
              useValue: {
                getPaymentHistory: jest.fn().mockReturnValue(of({})),

                getWallets: jest.fn().mockReturnValue(of({ paymentAccounts: [] })),
                refreshPayments: jest.fn(),
                refreshHistory: jest.fn(),
                getUpcomingPayments: jest.fn().mockReturnValue(of([])),
                refreshAll: jest.fn(),
              },
            },
            {
              provide: MakePaymentService,
              useValue: {
                setActivePayment: jest.fn(),
                getWalletData: jest.fn(),
              },
            },
            { provide: CallService, useValue: { call: jest.fn() } },
            {
              provide: GlobalStateService,
              useValue: {
                getIsStandalone: jest.fn(() => false),
                getRegistrationId: jest.fn(),
              },
            },
            {
              provide: LoadingController,
              useValue: { create: jest.fn(() => ({ present: jest.fn() })) },
            },
          ],
          imports: [
            PageTestingModule.withConfig({
              providesRouter: true,
              providesConfig: true,
              providesAlert: true,
              providesStorage: true,
              providesAnalytics: true,
              providesModal: true,
            }),
            UiKitsModule,
            ReactiveFormsModule,
            IonicModule,
            RouterTestingModule,
            CsaaPaymentDirectivesModule,
          ],
        }).compileComponents();

        CsaaAppInjector.injector = TestBed.inject(Injector);
        analyticService = TestBed.inject(AnalyticsService);
        fixture = TestBed.createComponent(PaymentMethodAccountPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
      } catch (error) {
        console.error(error);
        fail(error.message);
      }
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should track the open payment terms', async () => {
      const modalControllerMock = TestBed.inject(ModalController) as any;
      await component.openPaymentTerms();
      expect(analyticService.trackEvent).toHaveBeenCalledWith(
        EventName.TERMS_AND_CONDITIONS_CLICKED,
        Category.payments,
        {
          event_type: 'File Downloaded',
        }
      );
      expect(modalControllerMock.create).toHaveBeenCalled();
      expect(modalControllerMock.getTop()).toBeDefined();
    });
  });
} catch (error) {
  console.error(error);
  throw error;
}
