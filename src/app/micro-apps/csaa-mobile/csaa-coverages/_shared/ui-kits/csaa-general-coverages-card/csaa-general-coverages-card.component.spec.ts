import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CsaaCoverageCardItemComponent } from '../csaa-coverage-card-item/csaa-coverage-card-item.component';
import { By, generatePolicy, PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CommonModule } from '@angular/common';
import { CsaaGeneralCoveragesCardComponent } from './csaa-general-coverages-card.component';
import { GENERAL_COVERAGES_FIXTURE } from '../../../../../../../testing/fixtures/coverages/general.coverages.fixture';

describe('CsaaGeneralCoveragesCardComponent', () => {
  let component: CsaaGeneralCoveragesCardComponent;
  let fixture: ComponentFixture<CsaaGeneralCoveragesCardComponent>;

  beforeEach(async(async () => {
    try {
      TestBed.configureTestingModule({
        declarations: [CsaaGeneralCoveragesCardComponent, CsaaCoverageCardItemComponent],
        imports: [
          CommonModule,
          IonicModule,
          UiKitsModule,
          PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(CsaaGeneralCoveragesCardComponent);
      component = fixture.componentInstance;
      component.showEditPolicy = true;

      component.policyNumber = 'test';
      const policy = generatePolicy({
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

      component.policy = policy;

      component.coverages = GENERAL_COVERAGES_FIXTURE;

      fixture.detectChanges();
      await fixture.whenStable();
    } catch (error) {
      console.log(error);
    }
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshots when there are coverages', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshots when loading and there are coverages', () => {
    component.loading = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display edit policy when there is a PBE policy', () => {
    const editButton = fixture.debugElement.query(By.css('.editPolicyButton'));
    expect(editButton).toBeTruthy();
  });

  it('should match snapshots when loading and there are no coverages', () => {
    component.loading = true;
    component.coverages = [];
    fixture.detectChanges();
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
