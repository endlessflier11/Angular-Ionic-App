jest.mock('@aaa-mobile/capacitor-plugin', () => ({
  WebViewStyle: { STANDARD: 'standard' },
  Launch: {
    webView: jest.fn().mockReturnValue(
      Promise.resolve({
        reason: 'success',
      })
    ),
  },
}));
import { TestBed } from '@angular/core/testing';
import { WebviewService } from '..';
import { CONFIG_STATE_FIXTURE_MOCK, PageTestingModule, StoreTestBuilder } from '@app/testing';
import { CsaaCoreModule } from '../../../csaa-core/csaa-core.module';
import { CsaaAppInjector } from '../../../csaa-app.injector';
import { Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { ConfigAction } from '../../store/actions';

import { Launch, WebViewStyle } from '@aaa-mobile/capacitor-plugin';

const setConfigState = (store, newState) =>
  store.reset({
    ...store.snapshot(),
    csaa_app: {
      ...store.snapshot()['csaa_app'],
      csaa_config: { ...CONFIG_STATE_FIXTURE_MOCK, ...newState },
    },
  });

describe('WebviewService', () => {
  let service: WebviewService;
  let store: Store;
  let mockLink;
  const URL = 'http://expected.url';
  const COOKIE_LIST = [
    {
      domain: '.aaa.com',
      name: 'zipcode',
      permanent: 'true',
      value: 'null|AAA|005|SP',
    },
  ];
  const EXTRA_COOKIES = [
    {
      domain: '.extra.aaa.com',
      name: 'extra1',
      permanent: 'true',
      value: '12345',
    },
    {
      domain: '.extra.aaa.com',
      name: 'extra2',
      permanent: 'true',
      value: '6789',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CsaaCoreModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesConfig: true,
          providesModal: true,
          providesRouter: true,
        }),
      ],
    });
    CsaaAppInjector.injector = TestBed.inject(Injector);
    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    store.dispatch(new ConfigAction.CompleteRollbarSetup());
    service = TestBed.inject(WebviewService);

    mockLink = {
      link: {
        url: URL,
        navbarColor: '#E97527',
        options: {
          cookies: COOKIE_LIST,
        },
      },
      style: WebViewStyle.STANDARD,
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should ignore non iterable webview cookies object', () => {
    expect(service).toBeTruthy();
    setConfigState(store, { webviewCookies: null });
    service.open(URL);
    expect(Launch.webView).toHaveBeenCalledWith(mockLink);
  });

  it('should add webview cookies to the cookie list', () => {
    expect(service).toBeTruthy();
    setConfigState(store, { webviewCookies: EXTRA_COOKIES });
    service.open(URL);
    mockLink.link.options.cookies = [...COOKIE_LIST, ...EXTRA_COOKIES];
    expect(Launch.webView).toHaveBeenCalledWith(mockLink);
  });

  it('should ignore non iterable cookies param', () => {
    expect(service).toBeTruthy();
    service.openWithCookies(URL, null);
    expect(Launch.webView).toHaveBeenCalledWith(mockLink);
  });

  it('should add cookies params to the cookie list', () => {
    expect(service).toBeTruthy();
    service.openWithCookies(URL, EXTRA_COOKIES);
    mockLink.link.options.cookies = [...COOKIE_LIST, ...EXTRA_COOKIES];
    expect(Launch.webView).toHaveBeenCalledWith(mockLink);
  });
});
