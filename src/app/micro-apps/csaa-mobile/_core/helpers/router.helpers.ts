import { compile } from 'path-to-regexp';

import { namedRoutes } from '../../route-names.config';
import { NamedRoute, NamedRouteConfig, RouteParam } from '../interfaces';

const normalizedRoutes: NamedRoute[] = ((routeConfig: NamedRouteConfig[]): NamedRoute[] => {
  const asConfigItem = (parent: string, routeItem: NamedRouteConfig): NamedRoute => ({
    name: routeItem.name,
    path: parent + '/' + routeItem.path,
    relativePath: routeItem.path,
  });
  const prepareChildren = (
    parent: string,
    children: NamedRouteConfig[],
    acc: NamedRoute[] = []
  ) => {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < children.length; i++) {
      const currentRoute: NamedRouteConfig = children[i];
      acc.push(asConfigItem(parent, currentRoute));
      const routeChildren = currentRoute.children;
      if (routeChildren) {
        const currentPath = currentRoute.path ? parent + '/' + currentRoute.path : parent;
        prepareChildren(currentPath, routeChildren, acc);
      }
    }
    return acc;
  };
  return prepareChildren('', routeConfig);
})(namedRoutes);

export class RouterHelpers {
  static getRouteRelativePath = (name: string, fallback?: string): string => {
    const namedRoute = normalizedRoutes.find((r) => r.name === name);
    if (namedRoute) {
      return namedRoute.relativePath;
    } else {
      if (fallback) {return fallback;}
      const e = new Error(`Route [${name}] not defined`);
      console.error(e);
      throw e;
    }
  };

  static getRoutePath = (name: string, params?: RouteParam): string => {
    const namedRoute = normalizedRoutes.find((r) => r.name === name);
    if (namedRoute) {
      const path = compile(namedRoute.path)(params);
      return path === '/' ? '' : path;
    } else {
      const e = new Error(`Route [${name}] not defined`);
      console.error(e);
      throw e;
    }
  };
}
