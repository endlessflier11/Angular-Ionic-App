import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngxs/store';

import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { AppEndpointsEnum, CustomerSearchResponse, User } from '../../interfaces';
import { StorageService } from '../storage/storage.service';
import { CsaaAuthState } from '../../store/states/auth.state';
import { CsaaAuthAction } from '../../store/actions/auth.actions';
import {
  ClaimAction,
  CustomerAction,
  MetadataAction,
  PaymentAction,
  PolicyAction,
  UserSettingAction,
} from '../../store/actions';
import { HttpService } from '../http/http.service';

export interface CsaaTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  state?: string;
  expiresIn?: number;
}

export interface CsaaTokensManaged extends CsaaTokens {
  igAccessToken?: string;
  clubCode?: string;
  email?: string;
  custKey?: string;
}

export interface CsaaTokenData {
  sub?: string;
  /*eslint-disable @typescript-eslint/naming-convention*/
  member_number?: string;
  clubcode?: string;
  logintype?: string;
  cust_key?: string;
  last_name?: string;
  first_name?: string;
  /*eslint-enable @typescript-eslint/naming-convention*/
  ver?: number;
  iat?: number;
  exp?: number;
  scp?: string[];
  jti?: string;
  iss?: string;
  aud?: string;
  cid?: string;
  uid?: string;
  cn?: string;
}

export enum AuthEvents {
  LOGIN,
  LOGOUT,
}

@Injectable({
  providedIn: CsaaCommonModule,
})
export class AuthService {
  private readonly isAuthChecked$ = new BehaviorSubject<boolean>(false);

  private authEvents$: Observable<AuthEvents>;

  constructor(
    private readonly storage: StorageService,
    private readonly httpService: HttpService,
    private readonly store: Store
  ) {
    this.authEvents$ = this.store.select(CsaaAuthState.isLoggedIn).pipe(
      map((token) => (!!token ? AuthEvents.LOGIN : AuthEvents.LOGOUT)),
      distinctUntilChanged()
    );
  }

  public ready(): Observable<boolean> {
    return this.isAuthChecked$.asObservable().pipe(
      filter((v) => !!v),
      take(1),
      switchMap(() => this.isLoggedIn())
    );
  }

  public isLoggedIn(): Observable<boolean> {
    return this.store.select(CsaaAuthState.isLoggedIn).pipe(take(1));
  }

  logout(): Observable<any> {
    return this.store.dispatch(new CsaaAuthAction.Logout()).pipe(
      switchMap(() => this.store.dispatch(new MetadataAction.ResetMetadata())),
      switchMap(() =>
        this.store.dispatch([
          new CustomerAction.Reset(),
          new PolicyAction.Reset(),
          new PaymentAction.Reset(),
          new ClaimAction.Reset(),
          new UserSettingAction.Reset(),
        ])
      ),
      switchMap(() =>
        from(
          Promise.all([
            this.storage.remove(StorageService.KEY.ACCESS_TOKEN),
            this.storage.remove(StorageService.KEY.IG_ACCESS_TOKEN),
            this.storage.remove(StorageService.KEY.REFRESH_TOKEN),
            this.storage.remove(StorageService.KEY.LAST_WARNING_TIME),
          ])
        )
      )
    );
  }

  setAccessToken(tokens: CsaaTokensManaged): Observable<boolean> {
    return this.store.dispatch(new CsaaAuthAction.SetAccessToken(tokens));
  }

  /**
   * Get the current logged in user
   *
   * @return Observable
   */
  getUser(): Observable<User> {
    return of({ hash: '' });
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

  public fetchAuthenticatedCustomer(): Observable<CustomerSearchResponse> {
    const body = this.getUser() || { hash: '' };
    return this.httpService
      .postNamedResource<CustomerSearchResponse>(AppEndpointsEnum.customerSearch, body)
      .pipe(
        map((res) => res.body),
        map((data) => ({
          ...data,
          customerAddress: {
            ...data.customerAddress,
            isPoBox: /^\d+$/.test(data.customerAddress.address1),
          },
        }))
      );
  }
}
