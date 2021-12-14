import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTestingModule } from '@app/testing';
import { PaymentSelectMethodPage } from './payment-select-method.page';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';

describe('PaymentSelectMethodPage', () => {
  let component: PaymentSelectMethodPage;
  let fixture: ComponentFixture<PaymentSelectMethodPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentSelectMethodPage],
      imports: [
        PageTestingModule.withConfig({
          providesStorage: true,
          providesRouter: true,
          providesConfig: true,
        }),
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
      ],
      providers: [MakePaymentService],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSelectMethodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
