import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Select } from '@ngxs/store';
import { noop, Observable, of } from 'rxjs';
import { RouterHelpers } from '../../micro-apps/csaa-mobile';
import { CsaaAuthAction } from '../../micro-apps/csaa-mobile/_core/store/actions';
import { CsaaAuthState } from '../../micro-apps/csaa-mobile/_core/store/states/auth.state';
import { FetchState } from '../../micro-apps/csaa-mobile/_core/store/states/fetch.state';
import { AuthService } from '../../_core/services';

@Component({
  selector: 'csaa-aca-home-page',
  templateUrl: './aca-home-page.page.html',
  styleUrls: ['./aca-home-page.page.scss'],
})
export class AcaHomePagePage implements OnInit {
  public readonly route = RouterHelpers.getRoutePath;
  constructor(
    private readonly authService: AuthService,
    private readonly navController: NavController
  ) {}

  @Select(FetchState.isLoading(CsaaAuthAction.RequestIgAccessToken))
  isLoadingIgAccessToken$: Observable<boolean>;

  @Select(CsaaAuthState.isLoggedIn)
  isLoggedIn$: Observable<boolean>;

  ngOnInit() {}

  logout() {
    this.authService.logout().subscribe(
      () => {
        this.authService.ready().subscribe(() => {
          if (this.authService.isAuthenticated) {
            this.navController
              .navigateForward(RouterHelpers.getRoutePath('csaa.parent.app.aca'))
              .then(noop);
          }
        });
      },
      (error) => {
        console.log('CSAA: ', { error });
        return of(error);
      }
    );
  }
}
