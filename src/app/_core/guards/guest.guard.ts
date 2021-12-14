import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services';
import { switchMap } from 'rxjs/operators';
import { RouterHelpers } from '@csaadigital/mobile-mypolicy';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  public readonly route = RouterHelpers.getRoutePath;

  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  private get redirectTo(): string {
    return this.route('csaa.parent.home');
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.ready().pipe(
      switchMap(() => of(
          this.authService.isAuthenticated ? this.router.createUrlTree([this.redirectTo]) : true
        ))
    );
  }
}
