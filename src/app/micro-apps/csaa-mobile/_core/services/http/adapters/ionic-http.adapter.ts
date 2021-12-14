import { from, Observable, throwError } from 'rxjs';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { catchError, map } from 'rxjs/operators';
import { ResponseType, UniHttpAdapterTarget, UniHttpOptions } from '../../../interfaces';
import { HttpHeaders } from '@angular/common/http';
import { CONNECTION_ERRORS } from '../../../../constants';
import { UniHttpClient, UniHttpErrorResponse, UniHttpResponse } from '../uni-http.model';

export class IonicHttpAdapter extends UniHttpClient {
  target: UniHttpAdapterTarget = UniHttpAdapterTarget.NATIVE;

  constructor(private client: HTTP) {
    super();
    this.client.setDataSerializer('json');
  }

  private static convertFeedbackToResponse<T = any>(
    originalResponse: HTTPResponse
  ): UniHttpResponse<T> {
    return new UniHttpResponse<T>({
      status: originalResponse?.status,
      statusText: '', // not provided?
      body: originalResponse?.data,
      headers: new HttpHeaders(originalResponse?.headers),
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
      statusText: response?.statusText || '',
      error: response?.error,
      headers: response?.headers || {},
      message: response?.httpMessage,
      url: response?.url,
      isNetworkError: CONNECTION_ERRORS.includes(response?.status?.toString()),
    });
  }

  get<T = any>(url: string, options: UniHttpOptions = {}): Observable<UniHttpResponse<T>> {
    const requestOptions = {
      method: 'get' as any,
      params: options.params as { [index: string]: string },
      headers: options.headers || {},
      responseType: options.responseType || ResponseType.JSON,
    };
    return from(this.client.sendRequest(url, requestOptions)).pipe(
      map((resp) => IonicHttpAdapter.convertFeedbackToResponse(resp)),
      catchError((err) => {
        const { responseType } = requestOptions;
        return throwError(
          IonicHttpAdapter.convertErrorToResponse(
            {
              url,
              options: { method: 'GET', responseType },
            },
            this.parseJsonError(err)
          )
        );
      })
    );
  }

  post<T = any>(
    url: string,
    data: { [key: string]: any },
    options: UniHttpOptions = {}
  ): Observable<UniHttpResponse<T>> {
    // ****************************************************************************************** //
    // ****************************************************************************************** //
    // ****************************************************************************************** //
    // WARN: DO NOT REMOVE THIS, BECAUSE THERE IS A RISK THAT THE CLUB WILL CHANGE OUR SERIALIZER //
    // ************* UNLESS YOU WANT TO GET FIRED LIKE ME, SEE JIRA ISSUE MM-3012 *************** //
    // ****************************************************************************************** //
    // ****************************************************************************************** //
    // ****************************************************************************************** //
    this.client.setDataSerializer('json');
    // Todo: append options.params to url since it's not supported by ionic HTTP during post request
    const requestOptions = {
      method: 'post' as 'post',
      data,
      headers: options.headers || {},
      responseType: options.responseType || ResponseType.JSON,
    };
    return from(this.client.sendRequest(url, requestOptions)).pipe(
      map((resp) => IonicHttpAdapter.convertFeedbackToResponse<T>(resp)),
      catchError((err) => {
        const { responseType } = requestOptions;
        return throwError(
          IonicHttpAdapter.convertErrorToResponse(
            {
              url,
              options: { method: 'POST', responseType },
            },
            this.parseJsonError(err)
          )
        );
      })
    );
  }

  /**
   * Try to parse JSON error messages sent by backend server
   *
   * @param responseError error
   */
  private parseJsonError(responseError) {
    if (
      typeof responseError?.error === 'string' &&
      typeof responseError?.headers === 'object' &&
      typeof responseError.headers['content-type'] === 'string' &&
      responseError.headers['content-type'].startsWith('application/json')
    ) {
      try {
        responseError.error = JSON.parse(responseError.error);
      } catch (e) {
        console.error('JSON parsing error', e, responseError);
      }
    }
    return responseError;
  }
}
