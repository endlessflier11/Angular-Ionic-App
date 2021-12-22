import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PayallPage } from './payall.page';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';

describe('PayallPage', () => {
  let component: PayallPage;
  let fixture: ComponentFixture<PayallPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PayallPage],
        providers: [MakePaymentService],
        imports: [
          IonicModule.forRoot(),
          UiKitsModule,
          CsaaPaymentsUiKitsModule,
          PageTestingModule.withConfig({
            providesRouter: true,
            providesAnalytics: true,
            providesModal: true,
            providesRollbar: true,
            providesHttp: true,
            providesAuth: true,
            providesStorage: true,
          }),
        ],
      }).compileComponents();

      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);

      CsaaAppInjector.injector = TestBed.inject(Injector);
      fixture = TestBed.createComponent(PayallPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
