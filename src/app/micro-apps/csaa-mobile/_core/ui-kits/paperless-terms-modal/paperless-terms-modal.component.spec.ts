import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaperlessTermsModalComponent } from './paperless-terms-modal.component';
import { UiKitsModule } from '../../../_core/ui-kits/ui-kits.module';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { Store } from '@ngxs/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UniHttpAdapterTarget } from '../../../_core/interfaces';
import { HttpService } from '../../services';
import { CsaaHttpClientModule } from '../../csaa-http-client.module';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';

describe('PaperlessTermsModalComponent', () => {
  let component: PaperlessTermsModalComponent;
  let fixture: ComponentFixture<PaperlessTermsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CsaaCoreModule,
        UiKitsModule,
        HttpClientTestingModule,
        CsaaHttpClientModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesAnalytics: true,
          providesPlatform: true,
          providesWebviewService: true,
          providesRouter: true,
        }),
      ],
    }).compileComponents();

    const store = TestBed.inject(Store);
    const httpService = TestBed.inject(HttpService);
    (httpService as any).currentAdapterTarget = UniHttpAdapterTarget.NATIVE;
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);

    fixture = TestBed.createComponent(PaperlessTermsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });
});
