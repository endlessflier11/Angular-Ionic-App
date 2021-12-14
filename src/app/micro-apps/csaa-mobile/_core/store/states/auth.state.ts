import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { trackRequest } from '../../operators/track-request.operator';
import { CsaaTokens, RouterService } from '../../services';
import { SsoService } from '../../services/sso/sso.service';
import { StorageService } from '../../services/storage/storage.service';
import { MetadataAction } from '../actions';
import { CsaaAuthAction } from '../actions/auth.actions';
import { ConfigState } from './config.state';
import { CSAA_AUTH_STATE_TOKEN, AuthStateModel } from './state.interfaces';
import { noop } from 'rxjs';
import { reportError } from '../../helpers';
import { getTokenData, isTokenExpired } from '../../shared/token.helper';

const getInitState = (): AuthStateModel => ({
  accessToken: { accessToken: null },
  igAccessToken: { accessToken: null },
  loggedIn: false,
  user: null,
  username: null,
  custKey: null,
});

@State<AuthStateModel>({
  name: CSAA_AUTH_STATE_TOKEN,
  defaults: {
    ...getInitState(),
  },
})
@Injectable()
export class CsaaAuthState {
  // private authService: AuthService;
  @Selector()
  static igAccessToken({ igAccessToken: { accessToken } }: AuthStateModel): string {
    return accessToken;
  }

  @Selector()
  static user({ user }: AuthStateModel): string {
    return user;
  }

  @Selector()
  static username({ username }: AuthStateModel): string {
    return username;
  }

  @Selector()
  static isLoggedIn({ loggedIn }: AuthStateModel): boolean {
    return loggedIn;
  }

  constructor(
    private store: Store,
    private ssoService: SsoService,
    private storageService: StorageService,
    private routeService: RouterService
  ) {}

  @Action(CsaaAuthAction.SetAccessToken)
  setAccessToken(
    { patchState }: StateContext<AuthStateModel>,
    { tokens }: CsaaAuthAction.SetAccessToken
  ) {
    const { accessToken, igAccessToken, custKey } = tokens;
    patchState({
      accessToken: tokens,
    });
    this.storageService.set(StorageService.KEY.ACCESS_TOKEN, accessToken);

    const handleIgToken = this.store.selectSnapshot(ConfigState.handleIgToken);
    if (handleIgToken) {
      if ((!igAccessToken && accessToken) || custKey) {
        this.store.dispatch(new CsaaAuthAction.RequestIgAccessToken(tokens));
      }
    }
    if (igAccessToken || !handleIgToken) {
      return this.store.dispatch(
        new CsaaAuthAction.SetIgAccessToken({
          ...tokens,
          accessToken: igAccessToken || accessToken,
        })
      );
    }
  }

  @Action(CsaaAuthAction.SetIgAccessToken)
  setIgAccessToken(ctx: StateContext<AuthStateModel>, action: CsaaAuthAction.SetIgAccessToken) {
    const { accessToken } = action.tokens;
    const loggedIn = !!accessToken;

    ctx.patchState({ igAccessToken: action.tokens, loggedIn });
    this.storageService.set(StorageService.KEY.IG_ACCESS_TOKEN, accessToken).then(noop);

    return this.finalizeUserAuth(ctx, accessToken);
  }

  private finalizeUserAuth(ctx: StateContext<AuthStateModel>, accessToken?: string) {
    if (accessToken) {
      const {
        clubcode,
        sub: email,
        first_name,
        cust_key,
        member_number,
      } = getTokenData(accessToken);
      ctx.patchState({ user: email, username: first_name, custKey: cust_key });
      return this.store.dispatch(new MetadataAction.Initialize(email, clubcode, !member_number));
    }
    return this.store.dispatch(new MetadataAction.ResetMetadata());
  }

  @Action(CsaaAuthAction.CheckTokenExpired)
  checkTokenExpired() {
    const { igAccessToken } = this.store.selectSnapshot(CsaaAuthState);
    if (igAccessToken?.accessToken) {
      if (isTokenExpired(igAccessToken?.accessToken) && this.routeService.isCsaaModulesRoute()) {
        this.routeService.backToClubHome();
      }
    }
  }

  @Action(CsaaAuthAction.Logout)
  logout({ patchState }: StateContext<AuthStateModel>) {
    patchState({ ...getInitState(), loggedIn: false });
  }

  @Action(CsaaAuthAction.RequestIgAccessToken)
  requestIgAccessToken(_, { tokens }: CsaaAuthAction.RequestIgAccessToken) {
    this.ssoService
      .callTranslatorService(tokens)
      .pipe(trackRequest(CsaaAuthAction.RequestIgAccessToken))
      .subscribe({
        next: (data: CsaaTokens) => this.store.dispatch(new CsaaAuthAction.SetIgAccessToken(data)),
        error: (e) => {
          this.store.dispatch(new CsaaAuthAction.SetIgAccessToken({ accessToken: null }));
          console.error('CSAA: Request IG Access Token', e);
          reportError(e);
        },
      });
  }
}
