import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By, StoreTestBuilder, PageTestingModule } from '@app/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { LegalService } from '../../../../_core/services/legal.service';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';

import { AutopayTermsConditionsComponent } from './autopay-terms-conditions.component';
import { Store } from '@ngxs/store';
import { CsaaCoreModule } from '../../../../csaa-core/csaa-core.module';
try {
  describe('AutopayTermsConditionsComponent', () => {
    let component: AutopayTermsConditionsComponent;
    let fixture: ComponentFixture<AutopayTermsConditionsComponent>;

    beforeEach(async(() => {
      try {
        TestBed.configureTestingModule({
          declarations: [AutopayTermsConditionsComponent],
          providers: [
            {
              provide: LegalService,
              useValue: {
                loadAutopayTerms: jest
                  .fn()
                  .mockReturnValue(of({ body: '<h1>Terms and conditions</h1> Lore ipsum ...' })),
              },
            },
          ],
          imports: [
            PageTestingModule.withConfig({
              providesConfig: true,
              providesStorage: true,
              providesRouter: true,
              providesModal: true,
            }),
            IonicModule,
            UiKitsModule,
            CsaaCoreModule,
          ],
        }).compileComponents();
        const store = TestBed.inject(Store);
        StoreTestBuilder.withDefaultMocks().resetStateOf(store);

        fixture = TestBed.createComponent(AutopayTermsConditionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      } catch (error) {
        console.error(error);
        fail(error.message);
      }
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });
    it('should match snapshot', () => {
      expect(fixture).toMatchSnapshot();
    });
    it('should navigate to the back page when back button is clicked', () => {
      const backButton = fixture.debugElement.query(By.css('csaa-back-button'));
      expect(backButton).toBeTruthy();
    });
  });
} catch (error) {
  console.error(error);
  throw error;
}
