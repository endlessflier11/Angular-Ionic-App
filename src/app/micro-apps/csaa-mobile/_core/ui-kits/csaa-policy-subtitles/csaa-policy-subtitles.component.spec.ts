import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaPolicySubtitlesComponent } from './csaa-policy-subtitles.component';

describe('CsaaPolicySubtitlesComponent', () => {
  let component: CsaaPolicySubtitlesComponent;
  let fixture: ComponentFixture<CsaaPolicySubtitlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsaaPolicySubtitlesComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CsaaPolicySubtitlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
