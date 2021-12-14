import { Injectable } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AnimationOptions, NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { filter, map, pairwise, startWith, take } from 'rxjs/operators';

import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { RouterHelpers } from '../../helpers';
import { Category, CsaaRouteStackItem, EventName, EventType, RouteParam } from '../../interfaces';
import { AnalyticsService } from '../analytics.service';
import { ROOT_NAME__INDEX } from '../../../constants';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../store/states/config.state';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class RouterService {
  private readonly helpers = RouterHelpers;
  private stack: CsaaRouteStackItem[] = [];

  constructor(
    private readonly router: Router,
    private readonly navController: NavController,
    private readonly analyticsService: AnalyticsService,
    private readonly store: Store
  ) {
    // - When we first load the app, the index page is loaded
    // and our RouterService is not aware of this navigation at this time.
    // So this is a hack to push the index route to the stack from the beginning.
    // Of course, this is under the assumption that our only entry point is the index root.
    // During deep linking or page reload (browser), it's likely that this will fail.
    // - To push the actual route (no assumption), we will need to refactor this stack
    // so that item.name is replaced by item.url since we can't correctly deduce the route name from the url.
    // However, we can check a known route-name (see RouterService.currentRouteIs()) against a url to see if it's a match.
    this.stack.push({ name: ROOT_NAME__INDEX });

    this.store
      .select(ConfigState.configLoaded)
      .pipe(
        filter((loaded) => !!loaded),
        take(1)
      )
      .subscribe(() => {
        // Track regular flow for authenticated users
        this.router.events
          .pipe(
            filter((event) => event instanceof NavigationEnd),
            startWith({ url: '' }),
            pairwise()
          )
          .subscribe(this.lurkIgTabTappedEvents.bind(this));
        // Track the flow for guest users blocked by CsaaAuthGuard.canActivate
        this.router.events
          .pipe(
            filter((event) => event instanceof NavigationCancel),
            map((event) => [{ url: router.url }, event])
          )
          .subscribe(this.lurkIgTabTappedEvents.bind(this));
        // Track page changes
        this.router.events
          .pipe(
            filter((event) => event instanceof NavigationEnd),
            filter((event: NavigationEnd) => this.isCsaaModulesRoute(event.url))
          )
          .subscribe(() => this.analyticsService.page());
      });
  }

  /**
   * Track Insurance Tab Tapped event deriving the info from the route state
   * Will track everytime previous is from outside our module and actual going inside our module
   *
   * @param previous the rote user is coming from
   * @param actual the route user is going to
   */
  private lurkIgTabTappedEvents([previous, actual]: [
    NavigationEnd,
    NavigationEnd | NavigationCancel
  ]) {
    if (
      actual.url.includes(this.fullPath(ROOT_NAME__INDEX)) &&
      !previous.url.includes(this.getModuleRootPath())
    ) {
      this.analyticsService.trackEvent(EventName.INSURANCE_TAB_TAPPED, Category.application, {
        event_type: EventType.LINK_ACCESSED,
      });
    }
  }

  fullPath(name, params?: RouteParam) {
    return this.getModuleRootPath() + this.helpers.getRoutePath(name, params);
  }

  relativePath(name) {
    return this.helpers.getRouteRelativePath(name);
  }

  isCsaaModulesRoute(url: string = null) {
    const route = url || this.router.url;
    return !!route && route.startsWith(this.getModuleRootPath());
  }

  currentRouteIs(name, params?: RouteParam): boolean {
    const currentPath = this.router.url;
    const compiledPath = this.fullPath(name, params);
    return currentPath === compiledPath;
  }

  previousRouteIs(name, params?: RouteParam): boolean {
    if (this.stack.length < 2) {
      return false;
    }
    const lastItem = this.stack[this.stack.length - 2];
    return this.fullPath(lastItem.name, lastItem.params) === this.fullPath(name, params);
  }

  currentRouteContains(segment): boolean {
    return this.router.url.indexOf(segment) !== -1;
  }

  public getController(): NavController {
    return this.navController;
  }

  public navigateForward(
    name: string,
    params?: RouteParam,
    options?: NavigationOptions
  ): Promise<boolean> {
    if (name === ROOT_NAME__INDEX) {
      return this.navigateRoot(name, params, options);
    }
    this.stack.push({ name, params, options });
    return this.navController.navigateForward(this.fullPath(name, params), options);
  }

  public navigateBack(
    name: string,
    params?: RouteParam,
    options?: NavigationOptions
  ): Promise<boolean> {
    if (name === ROOT_NAME__INDEX) {
      return this.navigateRoot(name, params, options);
    }

    let to = this.stack.pop();
    while (to && to.name !== name) {
      to = this.stack.pop();
    }
    this.stack.pop();
    this.stack.push({ name, params, options });
    return this.navController.navigateBack(this.fullPath(name, params), options);
  }

  public navigateRoot(
    name: string = ROOT_NAME__INDEX,
    params?: RouteParam,
    options?: NavigationOptions
  ): Promise<boolean> {
    this.stack = [{ name, params, options }];
    return this.navController.navigateRoot(this.fullPath(name, params), options);
  }

  public back(options?: AnimationOptions): void {
    this.stack.pop();
    let to = this.stack.pop();
    if (!to) {
      to = { name: ROOT_NAME__INDEX };
    }
    to.options = options;
    this.stack.push(to);
    if (to.name === ROOT_NAME__INDEX) {
      this.navigateRoot(to.name, to.params, to.options);
    } else {
      this.navController.navigateBack(this.fullPath(to.name, to.params), to.options);
    }
  }

  public getTop(): CsaaRouteStackItem {
    if (this.stack.length > 0) {
      return { ...this.stack[this.stack.length - 1] };
    }
    return { name: ROOT_NAME__INDEX };
  }

  public navigateAway(path: string) {
    this.stack = [{ name: ROOT_NAME__INDEX }];
    this.navController.navigateBack(path);
  }

  private getModuleRootPath() {
    const { moduleRootPath } = this.store.selectSnapshot(ConfigState);
    return moduleRootPath;
  }

  backToClubHome() {
    const { homeBackButtonRedirectTo, moduleRootPath } = this.store.selectSnapshot(ConfigState);
    if (this.router.url !== moduleRootPath) {
      // If the user is not at home page, make sure to navigate back to HOME
      // due to MWG tabbed design and the way ionic tab works with router
      this.navigateRoot();
      setTimeout(() => this.navigateAway(homeBackButtonRedirectTo));
    } else {
      this.navigateAway(homeBackButtonRedirectTo);
    }
  }
}
