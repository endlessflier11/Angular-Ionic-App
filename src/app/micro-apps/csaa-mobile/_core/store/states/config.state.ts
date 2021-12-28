import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import {
  AppEndpoints,
  CsaaConfig,
  CsaaTheme,
  CsaaThemeColors,
  FetchStatus,
} from '../../interfaces';
import { ConfigAction, ServiceLocatorAction } from '../actions';
import {
  bfixEnvironment,
  devEnvironment,
  perfEnvironment,
  prodEnvironment,
  qaEnvironment,
} from '../../services/config/config';
import { onceTruthy } from '../../operators/conditional.operator';
import { trackRequest } from '../../operators/track-request.operator';
import { CONFIG_STATE_TOKEN, ConfigStateModel } from './state.interfaces';

@State<ConfigStateModel>({
  name: CONFIG_STATE_TOKEN,
  defaults: {
    isNative: false,
    hostAppReady: false,
    activeConfigData: null,
    configLoaded: false,
    preferredTheme: CsaaTheme.DEFAULT,
    moduleRootPath: null,
    nonInsuredRedirectTo: null,
    nonInsuredRedirectToExternal: null,
    showHomeHeader: false,
    homeBackButtonRedirectTo: '/',
    handleIgToken: false,
    clubCode: '005',
    zipCode: null,

    // The state below doesn't rTate to config specifically, but we don't want our store too fragmented,
    // cause it will only make our lives harder
    appEndpoints: null,
    endpointsLoadState: FetchStatus.NOT_FETCHED,
    segmentLoaded: false,
    rollbarReady: false,
    storeInitialized: false,
    webviewCookies: [],
  },
})
@Injectable()
export class ConfigState {
  private static readonly availableThemeColors: Map<CsaaTheme, CsaaThemeColors> = new Map();
  public readonly availableConfigs: CsaaConfig[] = [
    prodEnvironment,
    qaEnvironment,
    devEnvironment,
    perfEnvironment,
    bfixEnvironment,
  ];

  constructor(private readonly store: Store) {
    ConfigState.availableThemeColors.set(CsaaTheme.DEFAULT, {
      primary: '#3880ff',
      webview: '#E97527',
    });
    ConfigState.availableThemeColors.set(CsaaTheme.MWG, {
      primary: '#003087',
      webview: '#E97527',
    });
    ConfigState.availableThemeColors.set(CsaaTheme.ACA, {
      primary: '#034f9d',
      webview: '#E97527',
    });
  }

  @Selector()
  static configAndEndpointsLoaded(state: ConfigStateModel): boolean {
    return state?.configLoaded && state?.endpointsLoadState === FetchStatus.SUCCESS;
  }

  @Selector()
  static appEndpoints(state: ConfigStateModel): AppEndpoints {
    return state?.appEndpoints?.endpoints;
  }

  @Selector()
  static activeConfig(state: ConfigStateModel): CsaaConfig {
    return state?.activeConfigData;
  }

  @Selector()
  static segmentLoaded(state: ConfigStateModel): boolean {
    return state?.segmentLoaded;
  }

  @Selector()
  static rollbarReady(state: ConfigStateModel): boolean {
    return state?.rollbarReady;
  }

  @Selector()
  static configLoaded(state: ConfigStateModel): boolean {
    return state?.configLoaded;
  }

  @Selector()
  static endpointsLoaded(state: ConfigStateModel): boolean {
    return state?.endpointsLoadState === FetchStatus.SUCCESS;
  }

  @Selector()
  static endpointsLoading(state: ConfigStateModel): boolean {
    return state?.endpointsLoadState === FetchStatus.FETCHING;
  }

  @Selector()
  static theme(state: ConfigStateModel): CsaaTheme {
    return state?.preferredTheme;
  }

  @Selector()
  static themeColors(state: ConfigStateModel): CsaaThemeColors {
    return ConfigState.availableThemeColors.get(
      ConfigState.availableThemeColors.has(state?.preferredTheme)
        ? state?.preferredTheme
        : CsaaTheme.DEFAULT
    );
  }

  @Selector()
  static handleIgToken({ handleIgToken }: ConfigStateModel): boolean {
    return handleIgToken;
  }

  ngxsOnInit(ctx: StateContext<ConfigStateModel>) {
    ctx.dispatch(new ConfigAction.SetStoreInitialized());
  }

  @Action(ConfigAction.Setup)
  setup({ getState, patchState }: StateContext<ConfigStateModel>, action: ConfigAction.Setup) {
    const {
      theme,
      isNative,
      data: {
        moduleRootPath,
        nonInsuredRedirectTo,
        showHomeHeader,
        homeBackButtonRedirectTo,
        handleIgToken,
        clubCode,
        zipCode,
        nonInsuredRedirectToExternal,
      },
    } = action;
    patchState({
      hostAppReady: true,
      moduleRootPath,
      nonInsuredRedirectTo,
      nonInsuredRedirectToExternal,
      showHomeHeader,
      homeBackButtonRedirectTo,
      preferredTheme: theme || getState().preferredTheme,
      isNative,
      handleIgToken,
      clubCode: clubCode || '005',
      zipCode: zipCode || null,
    });
  }

  @Action(ConfigAction.SetActiveConfig)
  setActiveConfig(
    { patchState, getState }: StateContext<ConfigStateModel>,
    action: ConfigAction.SetActiveConfig
  ) {
    let activeConfig = this.availableConfigs.find((c) => c.env === action.key);
    if (getState().preferredTheme !== undefined) {
      activeConfig = { ...activeConfig, theme: getState().preferredTheme };
    }

    if (getState().appEndpoints) {
      activeConfig = {
        ...activeConfig,
      };
    }

    patchState({
      configLoaded: true,
      activeConfigData: activeConfig,
    });
  }

  @Action(ConfigAction.SetAppEndpoints)
  setAppEndpoints(
    { patchState, getState }: StateContext<ConfigStateModel>,
    { appEndpointsData, error }: ConfigAction.SetAppEndpoints
  ) {
    patchState({
      endpointsLoadState: error ? FetchStatus.ERROR : FetchStatus.SUCCESS,
      appEndpoints: appEndpointsData,
      activeConfigData: {
        ...getState().activeConfigData,
      },
    });
  }

  /**
   * NOTE! Because this Action Handler (ConfigAction.LoadAppEndpoints) depends on
   * another dynamic Action Handler (ServiceLocatorAction.LoadAppEndpoints),
   * it's not asynchronous and therefore will resolve even when the dynamic handler hasn't completed.
   * Please subscribe to the `ConfigState?.endpointsLoading` selector to know when loading started and stopped.
   */
  @Action(ConfigAction.LoadAppEndpoints, { cancelUncompleted: true })
  loadAppEndpoints(
    { dispatch, patchState, getState }: StateContext<ConfigStateModel>,
    { forceFromTheNetwork }: ConfigAction.LoadAppEndpoints
  ) {
    patchState({ endpointsLoadState: FetchStatus.FETCHING });
    this.store
      .select(ConfigState?.configLoaded)
      .pipe(
        onceTruthy(),
        switchMap(function test() {
          const { activeConfigData, isNative } = getState();
          return dispatch(
            new ServiceLocatorAction.LoadAppEndpoints(
              !isNative,
              activeConfigData.serviceLocatorUrl,
              forceFromTheNetwork
            )
          );
        }),
        trackRequest(ConfigAction.LoadAppEndpoints)
      )
      .subscribe();
  }

  @Action(ConfigAction.CompleteSegmentSetup)
  completeSegmentSetup({ patchState }: StateContext<ConfigStateModel>) {
    patchState({ segmentLoaded: true });
  }

  @Action(ConfigAction.CompleteRollbarSetup)
  completeRollbarSetup({ patchState }: StateContext<ConfigStateModel>) {
    patchState({ rollbarReady: true });
  }

  @Action(ConfigAction.SetStoreInitialized)
  setStoreInitialized({ patchState }: StateContext<ConfigStateModel>) {
    patchState({ storeInitialized: true });
  }

  @Action(ConfigAction.SetWebviewCookies)
  setWebviewCookies(
    { patchState }: StateContext<ConfigStateModel>,
    { cookies }: ConfigAction.SetWebviewCookies
  ) {
    patchState({ webviewCookies: cookies });
  }
}
