import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, LoadingController, Platform } from '@ionic/angular';
import { PaymentMethodCardPage } from './payment-method-card.page';
import { PageTestingModule, By, StoreTestBuilder } from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CardIO } from '@ionic-native/card-io/ngx';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { PaymentService } from '../../_core/services/payment.service';
import { of } from 'rxjs';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { ActivatedRoute } from '@angular/router';
import { CallService } from '../../_core/services/call.service';
import { GlobalStateService } from '../../_core/services/global-state.service';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';

import { delay } from '../../_core/helpers/async.helper';
import { CsaaPaymentDirectivesModule } from '../_shared/directives/csaa-payment-directives.module';
import { Category, EventName } from '../../_core/interfaces/analytics.interface';
import { Store } from '@ngxs/store';
import { BrMaskDirective } from 'br-mask';

try {
  describe('PaymentMethodCardPage', () => {
    let analyticService;
    let component: PaymentMethodCardPage;
    let fixture: ComponentFixture<PaymentMethodCardPage>;
    const PARAM_MAP = new Map();
    PARAM_MAP.set('account', '1234');

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [PaymentMethodCardPage, BrMaskDirective],
        providers: [
          CardIO,

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
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({ autoPay: false, policyNumber: '12345' }),
              paramMap: of(PARAM_MAP),
              queryParams: of(PARAM_MAP),
            },
          },
          { provide: CallService, useValue: { call: jest.fn() } },
          {
            provide: GlobalStateService,
            useValue: {
              getIsStandalone: jest.fn(() => false),
              getRegistrationId: jest.fn().mockReturnValue('12345'),
            },
          },
          {
            provide: LoadingController,
            useValue: { create: jest.fn(() => ({ present: jest.fn() })) },
          },
        ],
        imports: [
          PageTestingModule.withConfig({
            providesStorage: true,
            providesConfig: true,
            providesAlert: true,
            providesAnalytics: true,
            providesRouter: true,
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

      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      analyticService = TestBed.inject(AnalyticsService);
      fixture = TestBed.createComponent(PaymentMethodCardPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should match snapshots when clean', async () => {
      await delay(50);
      expect(fixture).toMatchSnapshot();
    });

    it('should display page title for cards', () => {
      const h1 = fixture.debugElement.query(By.cssAndText('h1', 'Credit or Debit Card'));
      expect(h1).toBeTruthy();
    });

    it('should have Done button disabled when form is invalid', () => {
      const doneButton = fixture.nativeElement.querySelector(
        'ion-header ion-buttons[slot=end] ion-button'
      );
      expect(doneButton.disabled).toBe(true);
    });

    it('should have Done button enabled when form is valid', () => {
      const nameInput = fixture.nativeElement.querySelector('[formcontrolname=cardHolderName]');
      nameInput.value = 'John Wick';
      nameInput.dispatchEvent(new Event('ionChange'));
      const cardNumberInput = fixture.nativeElement.querySelector('[formcontrolname=cardNumber]');
      cardNumberInput.value = '5262669012548834';
      cardNumberInput.dispatchEvent(new Event('ionBlur'));
      cardNumberInput.dispatchEvent(new Event('ionChange'));
      const expirationInput = fixture.nativeElement.querySelector('[formcontrolname=expiration]');
      const validExpire = `12/${new Date().getFullYear() - 2000 + 1}`;
      expirationInput.value = validExpire;
      expirationInput.dispatchEvent(new Event('ionChange'));
      const zipCodeInput = fixture.nativeElement.querySelector('[formcontrolname=zipCode]');
      zipCodeInput.value = '12345';
      zipCodeInput.dispatchEvent(new Event('ionChange'));
      const nickName = fixture.nativeElement.querySelector('[formcontrolname=nickname]');
      nickName.value = 'nickname 123';
      nickName.dispatchEvent(new Event('ionChange'));
      fixture.detectChanges();
      const doneButton = fixture.nativeElement.querySelector(
        'ion-header ion-buttons[slot=end] ion-button'
      );
      expect(doneButton.disabled).toBe(false);
    });

    it('should show validation error when name is empty', () => {
      const nameInput = fixture.nativeElement.querySelector('[formcontrolname=cardHolderName]');
      nameInput.value = '';
      nameInput.dispatchEvent(new Event('ionFocus'));
      nameInput.dispatchEvent(new Event('ionBlur'));
      fixture.detectChanges();

      const validationMessage = fixture.debugElement.query(
        By.cssAndText('span', 'The name is required')
      );
      expect(validationMessage).toBeTruthy();
    });

    it('should show validation error when card number has incorrect format', () => {
      const cardNumberInput = fixture.nativeElement.querySelector('[formcontrolname=cardNumber]');
      cardNumberInput.dispatchEvent(new Event('ionFocus'));
      cardNumberInput.value = '123';
      cardNumberInput.dispatchEvent(new Event('ionChange'));
      cardNumberInput.dispatchEvent(new Event('ionBlur'));
      fixture.detectChanges();
      const validationMessage = fixture.debugElement.query(
        By.cssAndText('.error-message', 'The card number is invalid')
      );
      expect(validationMessage).toBeTruthy();
    });

    it('should show validation error when zip code has incorrect format', () => {
      const zipCodeInput = fixture.nativeElement.querySelector('[formcontrolname=zipCode]');
      zipCodeInput.dispatchEvent(new Event('ionFocus'));
      zipCodeInput.value = '1122';
      zipCodeInput.dispatchEvent(new Event('ionChange'));
      zipCodeInput.dispatchEvent(new Event('ionBlur'));

      fixture.detectChanges();

      const validationMessage = fixture.debugElement.query(
        By.cssAndText('.error-message', 'The Zip Code has invalid format')
      );
      expect(validationMessage).toBeTruthy();
    });

    it('should show delete button if received edit: true from navParams', () => {
      component.isEditing = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.delete-card'));
      expect(button).toBeTruthy();
    });

    it('should hide scan card button if editing card', () => {
      component.isEditing = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('#scan-card-button'));
      expect(button).toBeFalsy();
    });

    it('should show saveCard toggle if not editing', () => {
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('#save-card-toggle'))).toBeTruthy();
    });

    it('should track the open payment terms', async () => {
      await component.openPaymentTerms();
      expect(analyticService.trackEvent).toHaveBeenCalledWith(
        EventName.TERMS_AND_CONDITIONS_CLICKED,
        Category.payments,
        {
          event_type: 'File Downloaded',
        }
      );
    });

    it('should navigate to terms and conditions page when button is clicked', () => {
      const span = fixture.debugElement.query(
        By.cssAndText('span', 'payment terms and conditions')
      );
      expect(span).toBeTruthy();
    });
  });
} catch (error) {
  console.error(error);
  throw error;
}
