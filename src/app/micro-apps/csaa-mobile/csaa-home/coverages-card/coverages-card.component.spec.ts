import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';

import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { CoveragesCardComponent } from './coverages-card.component';
import { CsaaPaymentsUiKitsModule } from '../../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';

describe('CoveragesCardComponent', () => {
  let component: CoveragesCardComponent;
  let fixture: ComponentFixture<CoveragesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoveragesCardComponent],
      imports: [
        PageTestingModule.withConfig({
          providesAnalytics: true,
          providesConfig: true,
          providesRouter: true,
        }),
        IonicModule.forRoot(),
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoveragesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
