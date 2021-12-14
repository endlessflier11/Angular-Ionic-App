import { AbstractType, InjectFlags, InjectionToken, Injector, Type } from '@angular/core';

export class CsaaAppInjector {
  public static injector: Injector;
  public static get<T>(
    token: Type<T> | InjectionToken<T> | AbstractType<T>,
    notFoundValue?: T,
    flags?: InjectFlags
  ): T {
    return CsaaAppInjector.injector.get(token, notFoundValue, flags);
  }
}
