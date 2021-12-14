import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertController, IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { AlertControllerMock, ConfigMockService, PageTestingModule } from '../../../testing';
import { ConfigService } from '../../micro-apps/csaa-mobile';
import { RouterService } from '../../micro-apps/csaa-mobile/_core/services';
import { BootstrapService } from '../../micro-apps/csaa-mobile/_core/services/bootstrap/bootstrap.service';
import { UiKitsModule } from '../../micro-apps/csaa-mobile/_core/ui-kits/ui-kits.module';
import { DevOptionsComponent } from '../../_core/components/dev-options/dev-options.component';

import { AcaDevSettingsPage } from './aca-dev-settings.page';

describe('AcaDevSettingsPage', () => {
  let component: AcaDevSettingsPage;
  let fixture: ComponentFixture<AcaDevSettingsPage>;

  beforeEach(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [AcaDevSettingsPage, DevOptionsComponent],
        imports: [
          IonicModule.forRoot(),
          RouterTestingModule,
          PageTestingModule.withConfig({ providesStorage: true }),
          UiKitsModule,
        ],
        providers: [
          { provide: ConfigService, useClass: ConfigMockService },
          {
            provide: BootstrapService,
            useValue: {
              forceLoadEndpoints: jest.fn().mockReturnValue(of(true)),
            },
          },
          { provide: AlertController, useClass: AlertControllerMock },
          {
            provide: RouterService,
            useValue: { navigateAway: jest.fn() },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AcaDevSettingsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
