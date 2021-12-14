import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController, IonicModule } from '@ionic/angular';

import { PaymentSelectAmountPage } from './payment-select-amount.page';
import { AlertControllerMock, By, PageTestingModule } from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PaymentService } from '../../_core/services/payment.service';
import { of } from 'rxjs';
import {
  Category,
  EventName,
  PaymentType,
  PolicyType,
  UpcomingPayment,
} from '../../_core/interfaces';
import { BrMaskDirective } from 'br-mask';
import DateHelper from '../../_core/shared/date.helper';
import { AnalyticsService, RouterService } from '../../_core/services';

const mockPaymentData = {
  vehicles: ['Lexus NX', 'BMW X1'],
  subtitle: 'test',
  autoPay: true,
  minimumAmount: 20,
  remainingPremium: 10000,
  otherAmount: 1000,
  type: PaymentType.other,
  nextDueDate: DateHelper.toDate('2040-08-19'),
  nextAmount: 30,
  allPolicies: false,
  policyNumber: 'AZSS294857564',
  policyType: PolicyType.Auto,
  dueDate: DateHelper.toDate('2018-08-10'),
  isPastDue: true,
  isPaymentDue: true,
  amount: 260.75,
  policyRiskState: 'test',
  autopayEnrollment: null,
};

describe('PaymentSelectAmountPage', () => {
  let analyticService;
  let routerService;
  let component: PaymentSelectAmountPage;
  let fixture: ComponentFixture<PaymentSelectAmountPage>;
  let makePaymentService: MakePaymentService;
  let alertControllerMock: AlertControllerMock;

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [PaymentSelectAmountPage, BrMaskDirective],
        imports: [
          RouterTestingModule,
          PageTestingModule.withConfig({
            providesStorage: true,
            providesConfig: true,
            providesRouter: true,
            providesAlert: true,
            providesAnalytics: true,
          }),
          UiKitsModule,
          CommonModule,
          ReactiveFormsModule,
          IonicModule,
          UiKitsModule,
        ],
        providers: [
          {
            provide: PaymentService,
            useValue: {
              getPaymentHistory: jest.fn().mockReturnValue(of({})),

              getWallets: jest.fn().mockReturnValue(of({})),
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
              getActivePayment: jest.fn().mockReturnValue(mockPaymentData),
              getReturnPathFromAmountMethodPages: jest.fn().mockReturnValue('path.to.index'),
            },
          },
        ],
      }).compileComponents();

      makePaymentService = TestBed.inject(MakePaymentService);
      routerService = TestBed.inject(RouterService);
      analyticService = TestBed.inject(AnalyticsService);
      alertControllerMock = TestBed.inject(AlertController) as any;
      makePaymentService.setActivePayment({} as UpcomingPayment); // Todo:: use valid mock

      fixture = TestBed.createComponent(PaymentSelectAmountPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.ionViewWillEnter();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenRenderingDone();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match screenshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should select the minimum due', () => {
    const minimumDue = fixture.debugElement.query(By.css('#item-minimum'));
    minimumDue.triggerEventHandler('click', null);
    fixture.detectChanges();
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    doneButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(makePaymentService.setActivePayment).toHaveBeenCalled();
    expect(routerService.back).toHaveBeenCalled();
  });

  it('should select the remaining due', () => {
    const remainingDue = fixture.debugElement.query(By.css('#item-remaining'));
    remainingDue.triggerEventHandler('click', null);
    fixture.detectChanges();
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    doneButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(makePaymentService.setActivePayment).toHaveBeenCalled();
    expect(routerService.back).toHaveBeenCalled();
  });

  it('should select the other amount and insert a input', () => {
    const otherAmountInput = fixture.nativeElement.querySelector('[formcontrolname= otherAmount]');
    otherAmountInput.value = '123.00';
    otherAmountInput.dispatchEvent(new Event('ionChange'));
    fixture.detectChanges();
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    doneButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(makePaymentService.setActivePayment).toHaveBeenCalled();
    expect(routerService.back).toHaveBeenCalled();
  });

  it('should dispaly alert informing user it cant pay over the minimum amount', () => {
    const otherAmountInput = fixture.nativeElement.querySelector('[formcontrolname= otherAmount]');
    otherAmountInput.value = '11.00';
    otherAmountInput.dispatchEvent(new Event('ionChange'));
    fixture.detectChanges();
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    doneButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(alertControllerMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'You are paying less than the minimum due.',
        message: 'Paying less than the minimum may result in policy cancelling.',
      })
    );
  });

  it('should dispaly alert informing user it cant pay over the remaining amount', () => {
    const otherAmountInput = fixture.nativeElement.querySelector('[formcontrolname= otherAmount]');
    otherAmountInput.value = '11000.00';
    otherAmountInput.dispatchEvent(new Event('ionChange'));
    fixture.detectChanges();
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    doneButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(alertControllerMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Payment error',
        message: 'You cannot pay more than the remaining premium.',
      })
    );
  });

  it('should track the cancel button', () => {
    const cancelButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Cancel'));
    cancelButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.PAYMENT_AMOUNT_CANCELLED,
      Category.payments
    );
  });
});
