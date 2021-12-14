import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaDriversCoveragesContentV2Component } from './csaa-drivers-coverages-content-v2.component';

describe('CsaaDriversCoveragesContentV2Component', () => {
  let component: CsaaDriversCoveragesContentV2Component;
  let fixture: ComponentFixture<CsaaDriversCoveragesContentV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsaaDriversCoveragesContentV2Component],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CsaaDriversCoveragesContentV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
