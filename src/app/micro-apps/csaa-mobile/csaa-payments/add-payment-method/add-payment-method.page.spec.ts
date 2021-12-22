import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaAddPaymentMethodPage } from './add-payment-method.page';
import { PageTestingModule } from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

describe('CsaaAddPaymentMethodPage', () => {
  let component: CsaaAddPaymentMethodPage;
  let fixture: ComponentFixture<CsaaAddPaymentMethodPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CsaaAddPaymentMethodPage],
        imports: [
          IonicModule.forRoot(),
          UiKitsModule,
          PageTestingModule.withConfig({ providesPlatform: true }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CsaaAddPaymentMethodPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
