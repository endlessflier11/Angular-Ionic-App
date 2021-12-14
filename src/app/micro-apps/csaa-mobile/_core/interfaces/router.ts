import { Route, UrlTree } from '@angular/router';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { Observable } from 'rxjs';

interface AppRoute extends Route {
  name?: string;
  isGroupIndex?: boolean; // If true, it means route is the index of parent. Then it inherits all parent properties
}

export type AppRoutes = AppRoute[];

export interface RouteParam {
  [key: string]: string;
}

export interface NamedRouteConfig {
  name: string;
  path: string;
  children?: NamedRouteConfig[];
}

export interface NamedRoute {
  name: string;
  path: string;
  relativePath: string;
}

export interface CanComponentDeactivate {
  canDeactivate: () =>
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree;
}

export interface CsaaRouteStackItem {
  name: string;
  params?: RouteParam;
  options?: NavigationOptions;
}
