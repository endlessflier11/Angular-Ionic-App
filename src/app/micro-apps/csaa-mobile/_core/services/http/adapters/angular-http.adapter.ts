import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UniHttpAdapterTarget, UniHttpOptions, ResponseType } from '../../../interfaces';
import { UniHttpClient, UniHttpErrorResponse, UniHttpResponse } from '../uni-http.model';

export class AngularHttpAdapter extends UniHttpClient {
  target: UniHttpAdapterTarget = UniHttpAdapterTarget.BROWSER;

  constructor(private client: HttpClient) {
    super();
  }

  private static convertFeedbackToResponse<T = any>(response: HttpResponse<T>): UniHttpResponse<T> {
    return new UniHttpResponse<T>({
      status: response?.status,
      statusText: response?.statusText,
      body: response?.body,
      headers: response?.headers,
    });
  }

  private static convertErrorToResponse(
    request: { url: string; options: Record<string, unknown> },
    response: any
  ): UniHttpErrorResponse {
    return new UniHttpErrorResponse({
      requestUrl: request?.url,
      requestOptions: request?.options,
      status: response?.status,
      statusText: response?.statusText,
      error: response?.error,
      headers: response?.headers,
      message: response?.message,
      url: response?.url,
      isNetworkError: response?.status === 0 && response?.statusText?.startsWith('Unknown Error'),
    });
  }

  get<T = any>(url: string, options: UniHttpOptions = {}): Observable<UniHttpResponse<T>> {
    return this.client
      .get<T>(url, {
        headers: options.headers,
        params: options.params,
        observe: 'response',
        responseType: (options.responseType || ResponseType.JSON) as any, // Todo: remove "any"
      })
      .pipe(
        map((resp) => AngularHttpAdapter.convertFeedbackToResponse<T>(resp)),
        catchError((err) => {
          const request = {
            url,
            options: {
              method: 'GET',
              responseType: options.responseType || ResponseType.JSON,
            },
          };
          return throwError(AngularHttpAdapter.convertErrorToResponse(request, err));
        })
      );
  }

  post<T = any>(
    url: string,
    data: { [key: string]: any },
    options: UniHttpOptions = {}
  ): Observable<UniHttpResponse<T>> {
    return this.client
      .post<T>(url, data, {
        headers: options.headers,
        params: options.params,
        observe: 'response',
        responseType: (options.responseType || ResponseType.JSON) as any, // Todo: remove "any"
      })
      .pipe(
        map((resp) => AngularHttpAdapter.convertFeedbackToResponse<T>(resp)),
        catchError((err) => {
          const request = {
            url,
            options: {
              method: 'POST',
              responseType: options.responseType || ResponseType.JSON,
            },
          };
          return throwError(AngularHttpAdapter.convertErrorToResponse(request, err));
        })
      );
  }
}
