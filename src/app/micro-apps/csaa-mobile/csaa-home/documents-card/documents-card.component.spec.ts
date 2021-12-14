import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { CsaaPaymentsUiKitsModule } from '../../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { DocumentsCardComponent } from './documents-card.component';

describe('DocumentsCardComponent', () => {
  let component: DocumentsCardComponent;
  let fixture: ComponentFixture<DocumentsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentsCardComponent],
      imports: [
        PageTestingModule.withConfig({
          providesRouter: true,
          providesAnalytics: true,
          providesConfig: true,
        }),
        IonicModule.forRoot(),
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
