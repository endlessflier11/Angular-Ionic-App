import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { addSeconds } from 'date-fns';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { User } from 'src/app/micro-apps/csaa-mobile/_core/interfaces';
import { AuthService as CsaaAuthService } from '@csaadigital/mobile-mypolicy';
import { StorageService } from '@csaadigital/mobile-mypolicy';
import { CsaaTokensManaged } from '../../../micro-apps/csaa-mobile/_core/services';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthChecked$ = new BehaviorSubject<boolean>(false);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject<User>(undefined);

  public get isAuthenticated(): boolean {
    return this.isAuthenticated$.value;
  }

  constructor(private storage: StorageService, private csaaAuthService: CsaaAuthService) {}

  public authStatus(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  public ready(): Observable<boolean> {
    return this.isAuthChecked$.asObservable().pipe(
      filter((v) => !!v),
      take(1),
      switchMap(() => of(this.isAuthenticated))
    );
  }

  initStandaloneAuthCheck() {
    if (this.isAuthChecked$.getValue()) {
      return of(this.isAuthenticated$.getValue());
    }
    return from(
      Promise.all([
        this.storage.get(StorageService.KEY.ACCESS_TOKEN),
        this.storage.get(StorageService.KEY.IG_ACCESS_TOKEN),
      ])
    ).pipe(
      catchError(() => of(null)),
      switchMap(([accessToken, igAccessToken]) => {
        // When using SSO bypass there will be an igAccessToken and no accessToken.
        if (!accessToken && !!igAccessToken) {
          accessToken = igAccessToken;
        }

        // TODO: Should we store desired user data in storage for standalone app?
        this.csaaAuthService.setAccessToken({ accessToken, igAccessToken }).subscribe();
        // TODO: Check token is still valid
        this.isAuthChecked$.next(true);
        this.isAuthenticated$.next(!!igAccessToken);
        return of(!!igAccessToken);
      })
    );
  }

  logout(): Observable<any> {
    return this.csaaAuthService.logout().pipe(
      switchMap(() => {
        this.isAuthenticated$.next(false);
        return of(true);
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  ssoSignIn(accessToken: string, refreshToken: string, expiresIn: string): Observable<void> {
    return this.csaaAuthService.setAccessToken({ accessToken }).pipe(
      switchMap(() => {
        const expiresAt = addSeconds(new Date(), parseInt(expiresIn, 10)).toString();
        return this.storeAuthenticated(accessToken, accessToken, refreshToken, expiresAt);
      })
    );
  }

  igManagedSignIn(_: string, tokens: CsaaTokensManaged): Observable<void> {
    const { accessToken, refreshToken, igAccessToken } = tokens;
    return this.csaaAuthService.setAccessToken(tokens).pipe(
      switchMap(() => {
        const expiresAt = addSeconds(new Date(), 900).toString();
        return this.storeAuthenticated(accessToken, igAccessToken, refreshToken, expiresAt);
      })
    );
  }

  private storeAuthenticated(
    accessToken: string,
    igAccessToken: string,
    refreshToken: string,
    expiresAt: string
  ) {
    return from(
      Promise.all([
        this.storage.set(StorageService.KEY.ACCESS_TOKEN, accessToken),
        this.storage.set(StorageService.KEY.IG_ACCESS_TOKEN, igAccessToken),
        this.storage.set(StorageService.KEY.REFRESH_TOKEN, refreshToken),
        this.storage.set(StorageService.KEY.EXPIRES_AT, expiresAt),
      ])
    ).pipe(
      switchMap(() => {
        this.user$.next({ hash: '' });
        return of(this.isAuthenticated$.next(!!igAccessToken));
      })
    );
  }
}
