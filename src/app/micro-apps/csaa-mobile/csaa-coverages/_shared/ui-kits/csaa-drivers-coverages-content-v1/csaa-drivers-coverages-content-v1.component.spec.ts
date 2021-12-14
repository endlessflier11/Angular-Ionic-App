import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaDriversCoveragesContentV1Component } from './csaa-drivers-coverages-content-v1.component';

describe('CsaaDriversCoveragesContentV1Component', () => {
  let component: CsaaDriversCoveragesContentV1Component;
  let fixture: ComponentFixture<CsaaDriversCoveragesContentV1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsaaDriversCoveragesContentV1Component],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CsaaDriversCoveragesContentV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
