/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle */
export class PlatformMockService {
  private _isNative = false;
  private _isIos = false;

  isAndroid = jest.fn().mockImplementation(() => !this._isIos);
  isIos = jest.fn().mockImplementation(() => this._isIos);
  isBrowser = jest.fn().mockImplementation(() => !this._isNative);
  isNative = jest.fn().mockImplementation(() => this._isNative);

  setIsNative(native: boolean) {
    this._isNative = !!native;
  }

  setIsIOS(ios: boolean) {
    this._isIos = !!ios;
  }
}
