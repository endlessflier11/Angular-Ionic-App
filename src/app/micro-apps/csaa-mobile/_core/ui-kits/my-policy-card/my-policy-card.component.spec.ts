import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyPolicyCardComponent } from './my-policy-card.component';
import { Storage } from '@ionic/storage';
import { By, StorageMock, WebviewMockService } from '@app/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AnalyticsService, SsoService, WebviewService } from '../../services';
import { AnalyticsMockService } from '../../../../../../testing/services/analytics-mock.service';

describe('MyPolicyCardComponent', () => {
  let component: MyPolicyCardComponent;
  let fixture: ComponentFixture<MyPolicyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyPolicyCardComponent],
      imports: [IonicModule, HttpClientTestingModule],
      providers: [
        { provide: AnalyticsService, useClass: AnalyticsMockService },
        { provide: Storage, useClass: StorageMock },
        { provide: SsoService, useValue: {} },
        { provide: WebviewService, useClass: WebviewMockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPolicyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be able to click on the my policy card', () => {
    const button = fixture.debugElement.query(By.css('.csaa-card '));
    button.triggerEventHandler('Click', null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
