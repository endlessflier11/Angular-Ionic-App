import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  AlertController,
  IonicModule,
  LoadingController,
  ModalController,
  Platform,
} from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import {
  AnalyticsMockService,
  AuthMockService,
  ConfigMockService,
  HttpMockService,
  MetadataMockService,
  PlatformMock,
  RollbarReporterMockService,
  SsoMockService,
  StorageMock,
  StorageMockService,
  WebviewMockService,
} from '../services';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CsaaHttpClientModule } from '../../app/micro-apps/csaa-mobile/_core/csaa-http-client.module';
import { AlertControllerMock, LoadingControllerMock } from '@app/testing';
import {
  AnalyticsService,
  AuthService,
  ConfigService,
  HttpService,
  MetadataService,
  RouterService,
  SsoService,
  StorageService,
  WebviewService,
} from '../../app/micro-apps/csaa-mobile/_core/services';
import { CsaaCoreModule } from '../../app/micro-apps/csaa-mobile/csaa-core/csaa-core.module';
import { NgxsModule } from '@ngxs/store';
import { AppState } from '../../app/_core/store';
import { Storage } from '@ionic/storage';
import { RollbarReporterService } from '../../app/micro-apps/csaa-mobile/_core/services/rollbar-reporter/rollbar-reporter.service';
import { RouterMockService } from '../services/router-mock.service';

export interface PageTestingModuleConfig {
  providesAuth?: boolean;
  providesSso?: boolean;
  providesAlert?: boolean;
  providesModal?: boolean;
  providesLoader?: boolean;
  providesStorage?: boolean;
  providesRollbar?: boolean;
  providesAnalytics?: boolean;
  providesWebviewService?: boolean;
  providesPlatform?: boolean;
  providesConfig?: boolean;
  providesRouter?: boolean;
  providesHttp?: boolean;
  providesMetadata?: boolean;
}

const EXPORTABLE_MODULES = [
  IonicModule,
  CommonModule,
  ReactiveFormsModule,
  HttpClientTestingModule,
  CsaaHttpClientModule,
];

@NgModule({
  imports: [
    ...EXPORTABLE_MODULES,
    RouterTestingModule.withRoutes([]),
    NgxsModule.forRoot([AppState]),
    CsaaCoreModule.forRoot(),
  ],
  exports: [...EXPORTABLE_MODULES, RouterTestingModule],
})
export class PageTestingModule {
  static withConfig(config: PageTestingModuleConfig): ModuleWithProviders<PageTestingModule> {
    const providers = [
      config.providesHttp && { provide: HttpService, useClass: HttpMockService },
      config.providesAuth && { provide: AuthService, useClass: AuthMockService },
      config.providesSso && { provide: SsoService, useClass: SsoMockService },
      config.providesAlert && { provide: AlertController, useClass: AlertControllerMock },
      config.providesModal && { provide: ModalController, useClass: AlertControllerMock },
      config.providesLoader && { provide: LoadingController, useClass: LoadingControllerMock },
      config.providesStorage && { provide: Storage, useClass: StorageMock },
      config.providesStorage && { provide: StorageService, useClass: StorageMockService },
      config.providesConfig && { provide: ConfigService, useClass: ConfigMockService },
      config.providesRouter && { provide: RouterService, useClass: RouterMockService },
      config.providesRollbar && {
        provide: RollbarReporterService,
        useClass: RollbarReporterMockService,
      },
      config.providesWebviewService && { provide: WebviewService, useClass: WebviewMockService },
      config.providesAnalytics && {
        provide: AnalyticsService,
        useClass: AnalyticsMockService,
      },
      config.providesPlatform && { provide: Platform, useClass: PlatformMock },
      config.providesMetadata && { provide: MetadataService, useClass: MetadataMockService },
    ];
    return {
      ngModule: PageTestingModule,
      providers: providers.filter((p) => !!p),
    };
  }
}
