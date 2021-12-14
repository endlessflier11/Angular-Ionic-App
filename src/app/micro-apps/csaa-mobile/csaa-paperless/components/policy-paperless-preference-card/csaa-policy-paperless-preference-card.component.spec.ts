import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, Platform } from '@ionic/angular';

import { CsaaPolicyPaperlessPreferenceCardComponent } from './csaa-policy-paperless-preference-card.component';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { AccordionModule } from '../../../_core/ui-kits/accordion/accordion.module';
import {
  AnalyticsService,
  ConfigService,
  RouterService,
  SsoService,
  WebviewService,
} from '../../../_core/services';
import {
  AnalyticsMockService,
  ConfigMockService,
  PlatformMock,
  SsoMockService,
  StorageMock,
  WebviewMockService,
} from '@app/testing';
import { CsaaStoreModule } from '../../../_core/store/csaa-store.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Storage } from '@ionic/storage';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaHttpClientModule } from '../../../_core/csaa-http-client.module';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';

describe('PolicyPaperlessPreferenceCardComponent', () => {
  let component: CsaaPolicyPaperlessPreferenceCardComponent;
  let fixture: ComponentFixture<CsaaPolicyPaperlessPreferenceCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CsaaPolicyPaperlessPreferenceCardComponent],
        providers: [
          { provide: Storage, useClass: StorageMock },
          { provide: Platform, useClass: PlatformMock },
          {
            provide: AnalyticsService,
            useClass: AnalyticsMockService,
          },
          {
            provide: WebviewService,
            useClass: WebviewMockService,
          },
          {
            provide: SsoService,
            useClass: SsoMockService,
          },
          {
            provide: ConfigService,
            useClass: ConfigMockService,
          },
          { provide: RouterService, useClass: RouterMockService },
        ],
        imports: [
          IonicModule.forRoot(),
          UiKitsModule,
          AccordionModule,
          CsaaStoreModule,
          CsaaCoreModule,
          UiKitsModule,
          HttpClientTestingModule,
          CsaaHttpClientModule,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CsaaPolicyPaperlessPreferenceCardComponent);
      component = fixture.componentInstance;
      component.policy = {} as any;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
