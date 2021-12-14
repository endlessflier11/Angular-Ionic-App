import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { generatePolicy, PageTestingModule } from '../../../../../testing';

import { Category, EventName } from '../../_core/interfaces';
import { Claim } from '../../_core/interfaces/claim.interface';
import { Policy } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';

import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { ClaimsCardComponent } from './claims-card.component';
import { Component, ViewChild } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: `test-host-component`,
  template: `<div>
    <csaa-claims-card [claims]="claims" [policies]="policies" [loading]="loading">
    </csaa-claims-card>
  </div>`,
})
export class ClaimsCardHostComponent {
  @ViewChild(ClaimsCardComponent)
  public claimsCardComponent: any;
  public claims: Claim[] = [];
  public policies: Policy[] = [];
  public loading = false;
}

describe('ClaimsCardComponent', () => {
  let claim: Claim;
  let policy: Policy;
  let component: ClaimsCardComponent;
  let fixture: ComponentFixture<ClaimsCardComponent>;
  let analyticsService: AnalyticsService;

  beforeEach(async(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [ClaimsCardComponent],
        providers: [{ provide: CallService, useValue: { call: jest.fn() } }],
        imports: [
          PageTestingModule.withConfig({
            providesAlert: true,
            providesRouter: true,
            providesAnalytics: true,
          }),
          IonicModule,
          IonicStorageModule.forRoot(),
          UiKitsModule,
        ],
      }).compileComponents();

      policy = generatePolicy({
        vehicles: [
          {
            id: 'WAUKJAFM8AA061319',
            name: 'Lamborghini Gallardo',
            coverages: [],
            riskFactors: { waivedLiability: true },
          },
          {
            id: 'WMWZC3C51EWP29276',
            name: 'Aston Martin DB9',
            coverages: [],
            riskFactors: { waivedLiability: false },
          },
        ],
      });

      claim = {
        number: '12345',
        status: 'active',
        cause: 'test',
        type: policy.type,
        policyNumber: policy.number,
        vehicle: policy.vehicles[0],
        workflow: [],
        address: policy.address,
      };

      analyticsService = TestBed.inject(AnalyticsService);
      fixture = TestBed.createComponent(ClaimsCardComponent);
      component = fixture.componentInstance;
      component.policies = [policy];
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track claims card', () => {
    component.openIHadAnAccident();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.I_HAD_AN_ACCIDENT_SELECTED,
      Category.claims,
      {
        event_type: 'Option Selected',
        selection: 'I Had An Accident',
      }
    );
  });
  it('should track the claims selected', async () => {
    await component.openDetails(claim);
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.CLAIM_SELECTED,
      Category.claims,
      {
        claim_number: claim.number,
        policies: [
          {
            policy_number: '1',
            policy_state: undefined,
            policy_type: 'Auto',
          },
        ],
        event_type: 'Option Selected',
        selection: 'Claims',
      }
    );
  });
  it('should track the card details', async () => {
    await component.openDetails(claim);
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.OPEN_CLAIMS_VIEWED,
      Category.claims,
      {
        claim_number: claim.number,
        link: 'Claims',
        policies: [
          {
            policy_number: '1',
            policy_state: undefined,
            policy_type: 'Auto',
          },
        ],
        event_type: 'Link Accessed',
      }
    );
  });

  it('should track What Do I Do ', () => {
    component.openWhatDoIDo();
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
      EventName.WHAT_DO_I_DO_SELECTED,
      Category.claims,
      {
        event_type: 'Option Selected',
        selection: 'What To Do',
      }
    );
  });
  it('should track the track agent contact', () => {
    component.trackAgentContact('Contact Claims');
    expect(analyticsService.trackEvent).toHaveBeenCalledWith(
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

describe('ClaimsCardComponent from Host', () => {
  let claim: Claim;
  let policy: Policy;
  let componentHost: ClaimsCardHostComponent;

  let fixture: ComponentFixture<ClaimsCardHostComponent>;

  beforeEach(async(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [ClaimsCardHostComponent, ClaimsCardComponent],
        providers: [{ provide: CallService, useValue: { call: jest.fn() } }],
        imports: [
          PageTestingModule.withConfig({
            providesAnalytics: true,
            providesRouter: true,
            providesConfig: true,
            providesAlert: true,
          }),
          IonicModule,
          IonicStorageModule.forRoot(),
          UiKitsModule,
        ],
      }).compileComponents();

      policy = generatePolicy({
        vehicles: [
          {
            id: 'WAUKJAFM8AA061319',
            name: 'Lamborghini Gallardo',
            coverages: [],
            riskFactors: { waivedLiability: true },
          },
          {
            id: 'WMWZC3C51EWP29276',
            name: 'Aston Martin DB9',
            coverages: [],
            riskFactors: { waivedLiability: false },
          },
        ],
      });

      claim = {
        number: '12345',
        status: 'active',
        cause: 'test',
        type: policy.type,
        policyNumber: policy.number,
        vehicle: policy.vehicles[0],
        workflow: [],
        address: policy.address,
      };

      fixture = TestBed.createComponent(ClaimsCardHostComponent);
      componentHost = fixture.componentInstance;
      componentHost.policies = [policy];
      componentHost.claims = [claim];
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  }));

  it('should create host component', () => {
    expect(componentHost).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('should not fail ngOnChanges if got null claims', () => {
    try {
      componentHost.claims = [claim, null, undefined, claim];
      fixture.detectChanges();
      expect(componentHost).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    } catch (e) {
      console.log(e);
      fail(e.message);
    }
  });
});
