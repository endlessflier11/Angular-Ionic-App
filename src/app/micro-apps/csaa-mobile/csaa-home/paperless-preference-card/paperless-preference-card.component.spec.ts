import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaperlessPreferenceCardComponent } from './paperless-preference-card.component';

import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { PageTestingModule } from '@app/testing';

describe('PaperlessPreferenceCardComponent', () => {
  let component: PaperlessPreferenceCardComponent;
  let fixture: ComponentFixture<PaperlessPreferenceCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PaperlessPreferenceCardComponent],
        imports: [
          PageTestingModule.withConfig({ providesRouter: true }),
          IonicModule.forRoot(),
          UiKitsModule,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PaperlessPreferenceCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
