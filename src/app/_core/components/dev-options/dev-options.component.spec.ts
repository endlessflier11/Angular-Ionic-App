import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  AuthMockService,
  PageTestingModule,
  PlatformMock,
  StorageMock,
  StoreTestBuilder,
} from '@app/testing';

import { AuthService, CsaaCoreModule, CsaaHttpClientModule } from '@csaadigital/mobile-mypolicy';

import { DevOptionsComponent } from './dev-options.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Storage } from '@ionic/storage';
import { Store } from '@ngxs/store';
import { RouterService } from '../../../micro-apps/csaa-mobile/_core/services';
import { RouterMockService } from '../../../../testing/services/router-mock.service';

describe('DevOptionsComponent', () => {
  let component: DevOptionsComponent;
  let fixture: ComponentFixture<DevOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DevOptionsComponent],
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        ReactiveFormsModule,
        CsaaHttpClientModule,
        HttpClientTestingModule,
        CsaaCoreModule,
        PageTestingModule.withConfig({ providesStorage: true }),
      ],
      providers: [
        {
          provide: Platform,
          useClass: PlatformMock,
        },
        {
          provide: AuthService,
          useClass: AuthMockService,
        },
        {
          provide: Storage,
          useClass: StorageMock,
        },
        { provide: RouterService, useClass: RouterMockService },
      ],
    }).compileComponents();

    const store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);

    fixture = TestBed.createComponent(DevOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
