import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { CsaaDriversCoveragesCardComponent } from './csaa-drivers-coverages-card.component';
import { CsaaDriversCoveragesContentV1Component } from '../csaa-drivers-coverages-content-v1/csaa-drivers-coverages-content-v1.component';
import { CsaaDriversCoveragesContentV2Component } from '../csaa-drivers-coverages-content-v2/csaa-drivers-coverages-content-v2.component';
import { PageTestingModule } from '@app/testing';

describe('CsaaDriversCoveragesCardComponent', () => {
  let component: CsaaDriversCoveragesCardComponent;
  let fixture: ComponentFixture<CsaaDriversCoveragesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CsaaDriversCoveragesCardComponent,
        CsaaDriversCoveragesContentV1Component,
        CsaaDriversCoveragesContentV2Component,
      ],
      imports: [
        PageTestingModule.withConfig({ providesAnalytics: true }),
        IonicModule.forRoot(),
        UiKitsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CsaaDriversCoveragesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
