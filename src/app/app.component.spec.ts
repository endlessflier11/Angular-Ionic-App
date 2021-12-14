import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Platform } from '@ionic/angular';

import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { PageTestingModule } from '@app/testing';
import { PlatformService } from './micro-apps/csaa-mobile/_core/services/platform.service';

jest.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setStyle: jest.fn().mockReturnValue(Promise.resolve()),
    setOverlaysWebView: jest.fn().mockReturnValue(Promise.resolve()),
    show: jest.fn().mockReturnValue(Promise.resolve()),
  },
  Style: {},
}));

describe('AppComponent', () => {
  let fixture;
  let component;
  let platformMock: jest.Mocked<Platform>;
  const platformReadyPromise = Promise.resolve();
  const consoleLog = global.console.log;

  beforeEach(() => {
    try {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
          RouterTestingModule,
          PageTestingModule.withConfig({
            providesStorage: true,
            providesAnalytics: true,
            providesConfig: true,
            providesAuth: true,
            providesPlatform: true,
          }),
        ],
      }).compileComponents();

      platformMock = TestBed.inject(Platform) as jest.Mocked<Platform>;
      const platformServiceMock = TestBed.inject(PlatformService);
      platformServiceMock.isNative = jest.fn(() => true);

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.debugElement.componentInstance;
    } catch (error) {
      console.error(error);
      fail(error.message);
    }
    global.console.log = jest.fn();
  });
  afterEach(() => (global.console.log = consoleLog));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the app', async () => {
    expect(platformMock.ready).toHaveBeenCalled();
    await platformReadyPromise;
  });

  // TODO: add more tests!
});
