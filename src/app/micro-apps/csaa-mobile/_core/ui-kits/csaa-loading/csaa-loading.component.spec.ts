import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaLoadingComponent } from './csaa-loading.component';

describe('CsaaLoadingComponent', () => {
  let component: CsaaLoadingComponent;
  let fixture: ComponentFixture<CsaaLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsaaLoadingComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CsaaLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
