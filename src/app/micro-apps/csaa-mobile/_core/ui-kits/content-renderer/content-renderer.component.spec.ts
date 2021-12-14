import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContentRendererComponent } from './content-renderer.component';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { UiKitsModule } from '../ui-kits.module';
import { Storage } from '@ionic/storage';
import { StorageMock } from '@app/testing';
import { NEVER } from 'rxjs';
import { RouterService } from '../../services';
import { RouterMockService } from '../../../../../../testing/services/router-mock.service';

describe('ContentRendererComponent', () => {
  let component: ContentRendererComponent;
  let fixture: ComponentFixture<ContentRendererComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        // declarations: [ContentRendererComponent],
        imports: [IonicModule.forRoot(), CsaaCoreModule, UiKitsModule],
        providers: [
          { provide: Storage, useClass: StorageMock },
          {
            provide: RouterService,
            useClass: RouterMockService,
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ContentRendererComponent);
      component = fixture.componentInstance;
      component.source$ = NEVER;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
