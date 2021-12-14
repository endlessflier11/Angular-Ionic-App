import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { Category, EventName } from '../../_core/interfaces';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaClaimsUiKitsModule } from '../_shared/ui-kits/csaa-claims-ui-kits.module';

import { ClaimsPreLossPage } from './claims-pre-loss.page';

describe('ClaimsPreLossPage', () => {
  let component: ClaimsPreLossPage;
  let fixture: ComponentFixture<ClaimsPreLossPage>;
  let analyticService;

  beforeEach(async(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [ClaimsPreLossPage],
        providers: [{ provide: CallService, useValue: { call: jest.fn() } }],
        imports: [
          PageTestingModule.withConfig({
            providesPlatform: true,
            providesConfig: true,
            providesRouter: true,
            providesAnalytics: true,
          }),
          IonicModule,
          UiKitsModule,
          CsaaClaimsUiKitsModule,
        ],
      }).compileComponents();

      analyticService = TestBed.inject(AnalyticsService);
      fixture = TestBed.createComponent(ClaimsPreLossPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track home button after button click', () => {
    component.backButtonClick();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.HOME_ACCESSED,
      Category.global,
      {
        event_type: 'Link Accessed',
        link: 'Home',
      }
    );
    expect(analyticService.trackEvent).toHaveBeenCalledTimes(1);
  });
  it('should track call claims', () => {
    component.callClaims();
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.CONTACT_INITIATED,
      Category.claims,
      {
        event_type: 'Option Selected',
        method: 'phone',
        selection: 'Contact Claims',
      }
    );
  });
});
