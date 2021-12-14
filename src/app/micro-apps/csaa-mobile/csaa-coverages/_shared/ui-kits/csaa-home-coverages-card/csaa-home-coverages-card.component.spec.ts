import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CsaaCoverageCardItemComponent } from '../csaa-coverage-card-item/csaa-coverage-card-item.component';
import { By, PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CommonModule } from '@angular/common';
import { CsaaHomeCoveragesCardComponent } from './csaa-home-coverages-card.component';
import { HOME_COVERAGES_FIXTURE } from '../../../../../../../testing/fixtures/coverages/home.coverages.fixture';
import { PolicyType } from '../../../../_core/interfaces';

describe('CsaaHomeCoveragesCardComponent', () => {
  let component: CsaaHomeCoveragesCardComponent;
  let fixture: ComponentFixture<CsaaHomeCoveragesCardComponent>;

  beforeEach(async(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [CsaaHomeCoveragesCardComponent, CsaaCoverageCardItemComponent],

        imports: [
          CommonModule,
          IonicModule,
          UiKitsModule,
          PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CsaaHomeCoveragesCardComponent);
      component = fixture.componentInstance;
      component.policy = {
        subtitle: 'Subtitle',
        type: PolicyType.Home,
        productClass: 'product class',
        deductible: { value: 1234 },
        coverages: HOME_COVERAGES_FIXTURE,
      };

      component.policyNumber = 'CAHO123456789';
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
    component.policy.coverages = [];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
  it('should display the Home coverage when there is one coverage', () => {
    component.policy.coverages = [component.policy.coverages[0]];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
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
