import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { FileAClaimCardComponent } from './file-a-claim-card.component';

import { PageTestingModule } from '@app/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Category, EventName } from '../../_core/interfaces';
import { Injector } from '@angular/core';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { SsoService } from '../../_core/services';
import { of } from 'rxjs';

describe('FileAClaimCardComponent', () => {
  let component: FileAClaimCardComponent;
  let fixture: ComponentFixture<FileAClaimCardComponent>;
  let analyticService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileAClaimCardComponent],
      providers: [
        {
          provide: SsoService,
          useValue: { generateWebDeeplink: jest.fn().mockReturnValue(of('claims')) },
        },
      ],
      imports: [
        PageTestingModule.withConfig({
          providesAnalytics: true,
          providesWebviewService: true,
          providesStorage: true,
        }),
        IonicModule,
        UiKitsModule,
        HttpClientTestingModule,
      ],
    }).compileComponents();
    CsaaAppInjector.injector = TestBed.inject(Injector);
    analyticService = TestBed.inject(AnalyticsService);
    fixture = TestBed.createComponent(FileAClaimCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track the open file a claim', () => {
    const JSDOM_OPEN = window.open;
    window.open = jest.fn();
    component.openFileAClaimPageInBrowser();
    window.open = JSDOM_OPEN;
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.FILE_A_CLAIM_SELECTED,
      Category.claims,
      {
        event_type: 'Link Accessed',
        link: 'MyPolicy Claims',
        link_placement: 'Home',
      }
    );
  });
});
