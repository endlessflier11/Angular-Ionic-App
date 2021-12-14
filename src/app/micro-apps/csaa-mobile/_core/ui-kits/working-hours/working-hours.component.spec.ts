/* eslint-disable no-underscore-dangle,@typescript-eslint/naming-convention */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WorkingHoursComponent } from './working-hours.component';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../../_core/store';
import { AnalyticsService, CallService, RouterService } from '../../services';
import { AnalyticsMockService } from '../../../../../../testing/services/analytics-mock.service';
import {
  CONFIG_STATE_FIXTURE_MOCK,
  CONTACT_INFO_STATE_FIXTURE_MOCK,
  StorageMock,
} from '@app/testing';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { Storage } from '@ionic/storage';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';

describe('WorkingHoursComponent', () => {
  let component: WorkingHoursComponent;
  let fixture: ComponentFixture<WorkingHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkingHoursComponent],
      imports: [IonicModule.forRoot(), NgxsModule.forRoot([AppState]), CsaaCoreModule],
      providers: [
        { provide: Storage, useClass: StorageMock },
        { provide: CallService, useValue: { call: jest.fn() } },
        { provide: AnalyticsService, useClass: AnalyticsMockService },
        { provide: RouterService, useClass: RouterMockService },
      ],
    }).compileComponents();

    const store = TestBed.inject(Store);
    store.reset({
      __csaa_app: {
        ...store.snapshot().__csaa_app,
        config: CONFIG_STATE_FIXTURE_MOCK,
        contactInfo: CONTACT_INFO_STATE_FIXTURE_MOCK,
      },
    });

    fixture = TestBed.createComponent(WorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
