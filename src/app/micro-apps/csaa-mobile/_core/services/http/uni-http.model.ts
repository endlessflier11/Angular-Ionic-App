import { HttpHeaders } from '@angular/common/http';
import {
  UniHttpAdapter,
  UniHttpAdapterTarget,
  UniHttpErrorResponseInterface,
  UniHttpOptions,
  UniHttpResponseInterface,
} from '../../interfaces';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';

export abstract class UniHttpClient implements UniHttpAdapter {
  target: UniHttpAdapterTarget;
  abstract get<T = any>(url: string, options?: UniHttpOptions): Observable<UniHttpResponse<T>>;
  abstract post<T = any>(
    url: string,
    data: { [key: string]: any },
    options?: UniHttpOptions
  ): Observable<UniHttpResponse<T>>;
}

export class UniHttpResponse<T = any> implements UniHttpResponseInterface {
  body: T;
  headers: HttpHeaders;
  status: number;
  statusText: string;
  constructor(init: UniHttpResponseInterface) {
    Object.assign(this, init);
  }
}

export class UniHttpErrorResponse extends UniHttpResponse implements UniHttpErrorResponseInterface {
  readonly name = 'UniHttpErrorResponse';
  readonly isNetworkError: boolean;
  readonly error: any;
  readonly message: string;
  readonly url: string;
  readonly requestUrl: string;
  readonly requestOptions: Record<string, unknown>;

  constructor(init: UniHttpErrorResponseInterface) {
    super(init);
    this.isNetworkError = init.isNetworkError || false;
    this.error = init.error || null;
    this.message =
      init.message || `Request completed with status ${init.status} - ${init.statusText}`;
    this.url = init.url;
  }
}

export const UNI_HTTP_ADAPTER = new InjectionToken<UniHttpClient[]>(
  'Registers a universal http client adapter',
  {
    providedIn: CsaaCommonModule,
    factory: () => [],
  }
);
