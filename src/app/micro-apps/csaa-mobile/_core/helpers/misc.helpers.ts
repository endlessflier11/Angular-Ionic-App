import { UniHttpErrorResponse } from '../services/http/uni-http.model';

export const noop = () => {};

export function isHttpError(error) {
  return error instanceof UniHttpErrorResponse;
}

export function getErrorStatus(error: any) {
  return isHttpError(error) ? (error as UniHttpErrorResponse).status : null;
}

const getDefault = (obj, key) => obj[key] || `(no ${key})`;
const stringifyErrorObject = (error) => {
  let entireErrorObject = '';
  try {
    entireErrorObject = JSON.stringify(error);
  } catch (e) {
    entireErrorObject = `unable to stringify error object due to ${e?.message}`;
  }
  return entireErrorObject;
};

function getHttpErrorDetails(error) {
  let errorObject = {} as any;
  try {
    if (typeof error.error === 'object') {
      // sometimes there is a pretty object
      errorObject = { ...error.error };
    } else {
      // trying to parse backend error JSON object
      errorObject = JSON.parse(error.error);
    }
  } catch {
    errorObject = { httpCode: error.status, httpMessage: error.message };
    if (typeof error.error === 'string') {
      try {
        error.message = error.error;
      } catch {
        // ignore
      }
    }
    errorObject.timeStamp = error.headers?.date;
    if (error.headers && error.headers['content-type']) {
      errorObject.moreInformation = `content-type: ${
        error.headers['content-type']
      } content-length: ${getDefault(error.headers, 'content-length')}`;
    }
  }

  errorObject.message = errorObject.message || error.message || errorObject.httpMessage;
  errorObject.timestamp = errorObject.timestamp || errorObject.timeStamp;
  errorObject.httpMessage = errorObject.httpMessage || errorObject.message;
  errorObject.moreInformation = errorObject.moreInformation || errorObject.details;
  errorObject.httpCode = errorObject.httpCode || error.status;
  const errorCode = errorObject.errorCode ? `Error code: ${errorObject.errorCode}` : '';
  const httpCode = getDefault(errorObject, 'httpCode');
  const httpMessage = getDefault(errorObject, 'httpMessage');
  const description = `${httpCode} ${httpMessage} ${errorCode}`;
  const requestUrl = getDefault(error, 'requestUrl');
  const requestOptions = error?.requestOptions || {};
  const requestMethod = getDefault(requestOptions, 'method');
  const requestResponseType = getDefault(requestOptions, 'responseType');

  return `${error.name || 'HTTP Error'} ${description}
- Request: ${requestMethod} ${requestUrl}
- Response Type: ${requestResponseType}
- URL: ${getDefault(error, 'url')}
- More Information: ${getDefault(errorObject, 'moreInformation')}
- Timestamp: ${getDefault(errorObject, 'timestamp')}
- Message: ${getDefault(errorObject, 'message')}
- Error Object: ${stringifyErrorObject(error)}`;
}

export const getErrorReason = (error) => {
  try {
    if (isHttpError(error)) {
      return getHttpErrorDetails(error);
    }
    return `${getDefault(error, 'message')}
- Stack: ${getDefault(error, 'stack')}
- Error Object: ${stringifyErrorObject(error)}`;
  } catch (e) {
    return `Unable to get the reason of the error due to: ${e}. Actual error: ${(
      error || 'undefined?'
    ).toString()}`;
  }
};
