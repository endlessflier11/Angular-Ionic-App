import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../../_shared/ui-kits/csaa-payments-ui-kits.module';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CallService } from '../../../_core/services/call.service';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CsaaHttpClientModule } from '../../../_core/csaa-http-client.module';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { Store } from '@ngxs/store';
import { Platform } from '@ionic/angular';
import { PaymentHistoryDetailPage } from './detail.page';
import { USER1_STATE_FIXTURES_MOCK } from '../../../../../../testing/fixtures/state/by-user-state.fixture';

describe('PaymentHistoryDetailPage', () => {
  let component: PaymentHistoryDetailPage;
  let fixture: ComponentFixture<PaymentHistoryDetailPage>;

  beforeEach(async () => {
    try {
      await TestBed.configureTestingModule({
        declarations: [PaymentHistoryDetailPage],
        imports: [
          PageTestingModule.withConfig({
            providesAnalytics: true,
            providesConfig: true,
            providesStorage: true,
          }),
          UiKitsModule,
          CsaaPaymentsUiKitsModule,
          CsaaCoreModule.forRoot(),
        ],
        providers: [
          HttpClientTestingModule,
          CsaaHttpClientModule,
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({
                policyNumber: USER1_STATE_FIXTURES_MOCK.CUSTOMER_POLICIES[0].policyNumber,
              }),
            },
          },
          { provide: CallService, useValue: { call: jest.fn() } },
        ],
      }).compileComponents();

      CsaaAppInjector.injector = TestBed.inject(Injector);
      const store = TestBed.inject(Store);
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
      await TestBed.inject(Platform).ready();

      fixture = TestBed.createComponent(PaymentHistoryDetailPage);
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
