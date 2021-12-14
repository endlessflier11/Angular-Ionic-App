import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsaaCoverageCardItemComponent } from '../csaa-coverage-card-item/csaa-coverage-card-item.component';
import { By, generatePolicy, PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CommonModule } from '@angular/common';
import { CsaaPupCoveragesCardComponent } from './csaa-pup-coverages-card.component';
import { PUP_COVERAGES_FIXTURE } from '../../../../../../../testing/fixtures/coverages/pup.coverages.fixture';
import { PolicyType } from '../../../../_core/interfaces';

describe('CsaaPupCoveragesCardComponent', () => {
  let component: CsaaPupCoveragesCardComponent;
  let fixture: ComponentFixture<CsaaPupCoveragesCardComponent>;
  const POLICY_NUMBER = 'CAPU123456789';

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [CsaaPupCoveragesCardComponent, CsaaCoverageCardItemComponent],

        imports: [
          CommonModule,
          IonicModule,
          UiKitsModule,
          PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CsaaPupCoveragesCardComponent);
      component = fixture.componentInstance;
      const policy = generatePolicy({ number: POLICY_NUMBER, type: PolicyType.PUP });
      component.policy = policy;
      component.policyNumber = policy.number;
      component.coverages = PUP_COVERAGES_FIXTURE;

      fixture.detectChanges();
      await fixture.whenStable();
    } catch (error) {
      console.log(error);
    }
  });
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
