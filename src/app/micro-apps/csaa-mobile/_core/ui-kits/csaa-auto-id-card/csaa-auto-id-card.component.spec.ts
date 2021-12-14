import { CommonModule, DatePipe } from '@angular/common';
import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigMockService, deepCopy, generatePolicy, PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { EMPLOYEE_SEARCH } from 'src/testing/fixtures/make-payments-page/employee-search.fixture';
import { DriverCoverageType } from '../../interfaces/driver.interface';
import { AnalyticsService, ConfigService } from '../../services';
import { UiKitsModule } from '../ui-kits.module';
import { CsaaAutoIdCardComponent } from './csaa-auto-id-card.component';

describe('CsaaAutoIdCardComponent', () => {
  let component: CsaaAutoIdCardComponent;
  let fixture: ComponentFixture<CsaaAutoIdCardComponent>;
  let httpTestingController: HttpTestingController;
  const realDateNow = Date.now.bind(global.Date);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CsaaAutoIdCardComponent],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            trackEvent: jest.fn(),
          },
        },
        { provide: ConfigService, useClass: ConfigMockService },
        {
          provide: DatePipe,
        },
      ],
      imports: [
        CommonModule,
        IonicModule,
        UiKitsModule,
        PageTestingModule.withConfig({ providesStorage: true }),
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CsaaAutoIdCardComponent);
    component = fixture.componentInstance;
    component.customerSearch = EMPLOYEE_SEARCH;

    component.policyNumber = 'WYSS910014303';

    component.termEffectiveDate = '2021-05-17';

    component.termExpirationDate = '2021-11-17';

    component.riskState = 'WY';

    const policy = generatePolicy({
      vehicles: [
        {
          id: 'WAUKJAFM8AA061319',
          vin: 'WAUKJAFM8AA061319',
          name: 'Lamborghini Gallardo',
          coverages: [],
          riskFactors: { waivedLiability: true },
        },
      ],
    });

    component.vehicle = policy.vehicles[0];

    component.insureds = [
      {
        id: 'kwgr0tN5YFM8ApZjQotDKg',
        isActive: true,
        firstName: 'JEAN',
        lastName: 'BRANDOS',
        primary: true,
      },
    ];

    component.drivers = [
      {
        id: 'WAUKJAFM8AA061319',
        fullName: 'Judy Quinn',
        dob: realDateNow,
        coverageType: DriverCoverageType.Excluded,
        coverages: [],
      },
    ];
    component.ngOnChanges({});

    fixture.detectChanges();
  });

  afterEach(() => {
    global.Date.now = realDateNow;
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match a snapshot for KY', () => {
    const customerSearch = deepCopy(EMPLOYEE_SEARCH);
    customerSearch.policies[0].riskState = 'KY';
    component.customerSearch = customerSearch;
    component.riskState = 'KY';
    component.ngOnChanges({});
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match a snapshot for NV', () => {
    const customerSearch = deepCopy(EMPLOYEE_SEARCH);
    customerSearch.policies[0].riskState = 'NV';
    component.customerSearch = customerSearch;
    component.riskState = 'NV';
    component.ngOnChanges({});
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match a snapshot for NJ', () => {
    const customerSearch = deepCopy(EMPLOYEE_SEARCH);
    customerSearch.policies[0].riskState = 'NJ';
    component.customerSearch = customerSearch;
    component.riskState = 'NJ';
    component.ngOnChanges({});
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match a snapshot for CA', () => {
    const customerSearch = deepCopy(EMPLOYEE_SEARCH);
    customerSearch.policies[0].riskState = 'CA';
    component.customerSearch = customerSearch;
    component.riskState = 'CA';
    component.ngOnChanges({});
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  
  it('should match a snapshot for OK', () => {
    const customerSearch = deepCopy(EMPLOYEE_SEARCH);
    customerSearch.policies[0].riskState = 'OK';
    component.customerSearch = customerSearch;
    component.riskState = 'OK';
    component.drivers[0].coverageType = DriverCoverageType.Excluded;
    component.ngOnChanges({});
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
