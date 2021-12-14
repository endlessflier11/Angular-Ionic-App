import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CsaaCoreModule } from './../../../../csaa-core/csaa-core.module';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';

import { AgentCardComponent } from './agent-card.component';
import { IonicStorageModule } from '@ionic/storage';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import { Category, EventName } from '../../../../_core/interfaces/analytics.interface';
import { EmailService } from '../../../../_core/services/email.service';

import { PageTestingModule } from '@app/testing';

describe('AgentCardComponent', () => {
  let component: AgentCardComponent;
  let fixture: ComponentFixture<AgentCardComponent>;
  let analyticsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AgentCardComponent],
      providers: [{ provide: EmailService, useValue: { mailTo: jest.fn() } }],
      imports: [
        PageTestingModule.withConfig({ providesAnalytics: true, providesRouter: true }),
        IonicModule,
        CsaaCoreModule.forRoot(),
        UiKitsModule,
        IonicStorageModule.forRoot(),
      ],
    }).compileComponents();

    analyticsService = TestBed.inject(AnalyticsService);
    fixture = TestBed.createComponent(AgentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track call claims', () => {
    component.onCall();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.CONTACT_INITIATED,
      Category.claims,
      {
        event_type: 'Option Selected',
        method: 'phone',
        selection: 'Contact Adjustor',
      }
    );
  });

  it('should track call claims', () => {
    component.onEmail();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('Contact Initiated', Category.claims, {
      event_type: 'Option Selected',
      method: 'email',
      selection: 'Contact Adjustor',
    });
  });
});
