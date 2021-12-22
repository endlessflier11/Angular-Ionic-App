import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CsaaCoverageCardItemComponent } from '../csaa-coverage-card-item/csaa-coverage-card-item.component';
import { CsaaCoveragesVehicleNotCoveredCardComponent } from './csaa-coverages-vehicle-not-covered-card.component';

import { By, generatePolicy, PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';

import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CommonModule } from '@angular/common';
import { VEHICLE_COVERAGES_FIXTURE } from '../../../../../../../testing/fixtures/coverages/vehicles.coverages.fixture';

describe('CsaaCoveragesVehicleNotCoveredCardComponent', () => {
  let component: CsaaCoveragesVehicleNotCoveredCardComponent;
  let fixture: ComponentFixture<CsaaCoveragesVehicleNotCoveredCardComponent>;

  beforeEach(async(async () => {
    try {
      TestBed.configureTestingModule({
        declarations: [CsaaCoveragesVehicleNotCoveredCardComponent, CsaaCoverageCardItemComponent],

        imports: [
          CommonModule,
          IonicModule,
          UiKitsModule,
          PageTestingModule.withConfig({ providesAnalytics: true, providesStorage: true }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CsaaCoveragesVehicleNotCoveredCardComponent);
      component = fixture.componentInstance;

      component.coverages = VEHICLE_COVERAGES_FIXTURE;
      component.policy = generatePolicy({});

      fixture.detectChanges();
      await fixture.whenStable();
    } catch (error) {
      console.log(error);
    }
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should match snapshots when there are coverages', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture).toMatchSnapshot();
  });
  it('should match snapshots when no coverages', () => {
    component.coverages = [];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('should display the vehicle coverage items not covered', () => {
    const coverageItem = fixture.debugElement.query(By.css('ion-item'));
    expect(coverageItem).toBeTruthy();
  });

  it('it should display one coverage item', () => {
    component.coverages = [component.coverages[0]];
    fixture.detectChanges();
    expect(fixture).toBeTruthy();
  });
  it('it should expand coverage card item ', () => {
    const coverageItem = fixture.debugElement.query(By.css('.csaa-coverage-card-item'));
    expect(coverageItem.query(By.css('.unopened-card'))).toBeTruthy();
    expect(coverageItem.query(By.css('.description'))).toBeFalsy();
    coverageItem.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(coverageItem.query(By.css('.unopened-card'))).toBeFalsy();
    expect(coverageItem.query(By.css('.description'))).toBeTruthy();
    expect(fixture).toMatchSnapshot();
  });

  it('it should collapse the card after clicking on the expanded card', () => {
    const coverageItem = fixture.debugElement.query(By.css('.csaa-coverage-card-item'));
    expect(coverageItem.query(By.css('.unopened-card'))).toBeTruthy();
    expect(coverageItem.query(By.css('.description'))).toBeFalsy();
    coverageItem.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(coverageItem.query(By.css('.unopened-card'))).toBeFalsy();
    expect(coverageItem.query(By.css('.description'))).toBeTruthy();
    coverageItem.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(coverageItem.query(By.css('.unopened-card'))).toBeTruthy();
    expect(coverageItem.query(By.css('.description'))).toBeFalsy();
    expect(fixture).toMatchSnapshot();
  });
});
