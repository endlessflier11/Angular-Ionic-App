import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import {
  AppEndpointsEnum,
  CustomerSearchResponse,
  User,
} from '../../app/micro-apps/csaa-mobile/_core/interfaces';
import {
  AuthEvents,
  CsaaTokens,
  HttpService,
} from '../../app/micro-apps/csaa-mobile/_core/services';
import { CsaaAuthState } from '../../app/micro-apps/csaa-mobile/_core/store/states/auth.state';

interface AuthServiceFaker {
  user: User;
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthMockService {
  private faker: AuthServiceFaker;
  private readonly isAuthChecked$ = new BehaviorSubject<boolean>(false);
  user$ = new BehaviorSubject<User>(undefined);

  token$ = new BehaviorSubject<string>(null);
  tokenData$ = new BehaviorSubject<CsaaTokens>(null);
  authEvents$ = this.token$.pipe(
    map((token) => (!!token ? AuthEvents.LOGIN : AuthEvents.LOGOUT)),
    distinctUntilChanged()
  );

  constructor(private store: Store, private httpService: HttpService) {
    // We aren't checking for previous auth session during test.
    this.isAuthChecked$.next(true);
  }

  public fakeLogin(user?: User): void {
    this.faker = {
      isLoggedIn: true,
      user: user || { hash: '' },
    };
    this.user$.next(this.faker.user);
    this.token$.next('FAKE_TOKEN');
    this.tokenData$.next({
      accessToken: 'FAKE_TOKEN',
      idToken: 'FAKE_ID_TOKEN',
      refreshToken: 'FAKE_REFRESH_TOKEN',
      state: 'FAKE_STATE',
    });
  }

  public fakeLogout(): void {
    this.faker = {
      isLoggedIn: false,
      user: undefined,
    };
    this.user$.next(this.faker.user);
    this.token$.next(null);
  }

  resetFaker() {
    this.faker = undefined;
  }

  private getFaker(): AuthServiceFaker {
    if (!this.faker) {
      throw Error('No faker available. Did you forget to call authMockService.fakeLogin()?');
    }
    return this.faker;
  }

  public get isAuthenticated(): boolean {
    return this.getFaker().isLoggedIn;
  }

  public ready(): Observable<boolean> {
    return this.isAuthChecked$.asObservable().pipe(
      filter((v) => !!v),
      take(1),
      switchMap(() => of(this.isAuthenticated))
    );
  }

  public authStatus(): Observable<boolean> {
    return of(this.getFaker().isLoggedIn);
  }

  logout(): Observable<any> {
    this.fakeLogout();
    return of(true);
  }

  // ssoSignIn(accessToken: string, refreshToken: string, expiresIn: string): Observable<void> {}
  getUser(): Observable<User> {
    return this.user$;
  }

  public onUserLogin(): Observable<AuthEvents> {
    return this.authEvents$.pipe(filter((e) => e === AuthEvents.LOGIN));
  }

  public onUserLogout(): Observable<AuthEvents> {
    return this.authEvents$.pipe(filter((e) => e === AuthEvents.LOGOUT));
  }

  public onAuthStateChange(): Observable<boolean> {
    return this.authEvents$.pipe(map((e) => e === AuthEvents.LOGIN));
  }

  getAuthToken(): Observable<string> {
    return this.token$.pipe(take(1));
  }

  getTokenData(): Observable<CsaaTokens> {
    return this.tokenData$.pipe(take(1));
  }

  public isLoggedIn(): Observable<boolean> {
    return this.store.select(CsaaAuthState.isLoggedIn).pipe(take(1));
  }

  public fetchAuthenticatedCustomer(): Observable<CustomerSearchResponse> {
    const body = this.getUser() || { hash: '' };
    return this.httpService
      .postNamedResource<CustomerSearchResponse>(AppEndpointsEnum.customerSearch, body)
      .pipe(map((res) => (res as any).body));
  }
}
