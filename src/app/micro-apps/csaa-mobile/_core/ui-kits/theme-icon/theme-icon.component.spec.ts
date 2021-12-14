import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ConfigMockService } from '../../../../../../testing';
import { ConfigService } from '../../services';

import { ThemeIconComponent } from './theme-icon.component';

describe('ThemeIconComponent', () => {
  let component: ThemeIconComponent;
  let fixture: ComponentFixture<ThemeIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThemeIconComponent],
      providers: [{ provide: ConfigService, useClass: ConfigMockService }],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
