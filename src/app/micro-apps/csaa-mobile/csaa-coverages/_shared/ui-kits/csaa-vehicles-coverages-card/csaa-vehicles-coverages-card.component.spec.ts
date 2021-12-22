import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AnalyticsService } from '../../../../_core/services/analytics.service';
import { RouterTestingModule } from '@angular/router/testing';

import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaVehiclesCoveragesCardComponent } from './csaa-vehicles-coverages-card.component';
import { CsaaCoreModule } from './../../../../csaa-core/csaa-core.module';
import { EventName, Policy, PolicyStatus, Category } from '../../../../_core/interfaces';
import { PageTestingModule } from '@app/testing';

describe('CsaaVehiclesCoveragesCardComponent', () => {
  let component: CsaaVehiclesCoveragesCardComponent;
  let fixture: ComponentFixture<CsaaVehiclesCoveragesCardComponent>;
  let analyticService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsaaVehiclesCoveragesCardComponent],
      imports: [
        PageTestingModule.withConfig({
          providesAnalytics: true,
          providesStorage: true,
          providesRouter: true,
        }),
        IonicModule.forRoot(),
        CsaaCoreModule.forRoot(),
        UiKitsModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: '1234',
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };

    analyticService = TestBed.inject(AnalyticsService);
    fixture = TestBed.createComponent(CsaaVehiclesCoveragesCardComponent);
    component = fixture.componentInstance;
    component.policy = mockPolicy;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track the open vehicles covergaes', () => {
    const vehicle = {
      id: '12345',
      name: 'Honda Civic',
      vin: '345678',
      make: 'Honda',
      model: 'civic',
      year: '2013',
      riskFactors: {
        waivedLiability: false,
        antiLockBrakes: true,
        antiTheft: true,
      },
    };
    component.openVehicleCoverages(vehicle);
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.VEHICLE_COVERAGE_SELECTED,
      Category.coverages,
      {
        event_type: 'Link Accessed',
        link: 'Vehicle Coverage',
        type: vehicle.name,
        policies: [
          {
            policy_number: '1234',
            policy_state: 'AZ',
            policy_type: 'Auto',
          },
        ],
      }
    );
  });
});
