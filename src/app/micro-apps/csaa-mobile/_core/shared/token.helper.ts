import { CsaaTokenData } from '../services';

export function isTokenExpired(token) {
  if (token) {
    const { exp } = getTokenData(token);
    const now = Date.now();
    return now >= exp * 1000;
  }
  return true;
}

export function getTokenData(token: string) {
  let tokenData: CsaaTokenData = {};
  if (token) {
    try {
      tokenData = JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      tokenData = {};
    }
  }
  return tokenData;
}
