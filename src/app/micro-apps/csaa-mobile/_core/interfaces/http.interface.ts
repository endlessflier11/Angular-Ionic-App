import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AppEndpointsEnum } from './config.interface';

export enum UniHttpAdapterTarget {
  NATIVE,
  BROWSER,
}

export enum ResponseType {
  JSON = 'json',
  TEXT = 'text',
  BLOB = 'blob',
}

export interface UniHttpAdapter {
  target: UniHttpAdapterTarget;
  get<T = any>(url: string, options?: UniHttpOptions): Observable<UniHttpResponseInterface<T>>;
  post<T = any>(
    url: string,
    data: { [key: string]: any },
    options?: UniHttpOptions
  ): Observable<UniHttpResponseInterface<T>>;
  // Todo: add PUT and DELETE verbs
}

export interface UniHttpOptions {
  responseType?: ResponseType;
  params?: { [param: string]: string | string[] };
  headers?: { [header: string]: string };
  namedEndpointKey?: AppEndpointsEnum;
}

export interface UniHttpNamedResourceOptions extends UniHttpOptions {
  routeParams?: { [k: string]: string };
}

export interface UniHttpResponseInterface<T = any> {
  body?: T;
  headers?: HttpHeaders;
  status: number;
  statusText: string;
}

export interface UniHttpErrorResponseInterface extends UniHttpResponseInterface {
  isNetworkError?: boolean;
  error?: any | null; // error response body
  message?: string;
  url?: string;
  requestUrl?: string;
  requestOptions?: Record<string, unknown>;
}
