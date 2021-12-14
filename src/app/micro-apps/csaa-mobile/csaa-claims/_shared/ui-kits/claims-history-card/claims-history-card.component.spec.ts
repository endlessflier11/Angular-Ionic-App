import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';

import { ClaimsHistoryCardComponent } from './claims-history-card.component';
import { ConfigMockService } from '@app/testing';
import { ConfigService } from '../../../../_core/services';

describe('ClaimsHistoryCardComponent', () => {
  let component: ClaimsHistoryCardComponent;
  let fixture: ComponentFixture<ClaimsHistoryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimsHistoryCardComponent],
      providers: [{ provide: ConfigService, useClass: ConfigMockService }],
      imports: [IonicModule.forRoot(), UiKitsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsHistoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
