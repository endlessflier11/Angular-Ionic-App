import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, LoadingController, Platform } from '@ionic/angular';

import { PolicyService } from '../../_core/services/policy.service';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { InsuranceCardComponent } from './insurance-card.component';

import { CsaaPaymentsUiKitsModule } from '../../csaa-payments/_shared/ui-kits/csaa-payments-ui-kits.module';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { CsaaStoreModule } from '../../_core/store/csaa-store.module';

import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { Store } from '@ngxs/store';

describe('InsuranceCardComponent', () => {
  let component: InsuranceCardComponent;
  let fixture: ComponentFixture<InsuranceCardComponent>;

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [InsuranceCardComponent],
        providers: [
          {
            provide: LoadingController,
            useValue: { create: jest.fn(() => ({ present: jest.fn() })) },
          },
          {
            provide: PolicyService,
            useValue: {
              getInsuredFirstName: jest.fn(),
              refreshPolicies: jest.fn(),
              listPolicies: jest.fn(),
              cleanUpPoliciesSubscriptions: jest.fn(),
            },
          },
          {
            provide: PolicyDocumentHelper,
            useValue: {
              openDocument: jest.fn(),
            },
          },
        ],
        imports: [
          PageTestingModule.withConfig({
            providesStorage: true,
            providesRouter: true,
            providesAnalytics: true,
            providesAlert: true,
          }),
          IonicModule,
          UiKitsModule,
          CsaaPaymentsUiKitsModule,
          CsaaCoreModule.forRoot(),
          CsaaStoreModule,
        ],
      }).compileComponents();

      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      fixture = TestBed.createComponent(InsuranceCardComponent);
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

  it('should match snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  // Todo: match snapshot for when policy is loaded
});
