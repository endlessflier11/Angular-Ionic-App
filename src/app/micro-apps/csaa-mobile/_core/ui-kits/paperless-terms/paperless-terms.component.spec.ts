import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaperlessTermsComponent } from './paperless-terms.component';
import {
  AnalyticsMockService,
  SsoMockService,
  StorageMock,
  WebviewMockService,
} from '@app/testing';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { Storage } from '@ionic/storage';
import { AnalyticsService, WebviewService } from '../../services';
import { LegalService } from '../../services/legal.service';
import { SsoService } from '../../../../../_core/services';

describe('PaperlessTermsComponent', () => {
  let component: PaperlessTermsComponent;
  let fixture: ComponentFixture<PaperlessTermsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PaperlessTermsComponent],
        imports: [IonicModule.forRoot(), CsaaCoreModule],
        providers: [
          { provide: AnalyticsService, useClass: AnalyticsMockService },
          { provide: Storage, useClass: StorageMock },
          { provide: LegalService, useValue: {} },
          { provide: WebviewService, useValue: WebviewMockService },
          { provide: SsoService, useValue: SsoMockService },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PaperlessTermsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it.skip('should create', () => {
    expect(component).toBeTruthy();
  });
});
