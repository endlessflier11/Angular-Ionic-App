import { AES } from 'crypto-js';
import * as Base64 from 'crypto-js/enc-base64';
import * as Utf8 from 'crypto-js/enc-utf8';
import { Observable, ReplaySubject, from, of } from 'rxjs';
import { map, mapTo, switchMap, take } from 'rxjs/operators';

import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
const PREFIX = 'CSAA';
export class CsaaSecureStorageService {
  private readyObservable = new ReplaySubject<boolean>(1);

  private secureStorage: Storage;
  private secret: string;

  constructor(
    private platformId: Platform,
    private identifier: string,
    private deviceId: string,
    private secureStorageKey: string
  ) {
    this.init();
  }

  public ready(): Observable<boolean> {
    return this.readyObservable.pipe(take(1));
  }

  public get<T>(key: string): Observable<T> {
    return from(this.secureStorage.get(`${PREFIX}_${key}`).catch(() => undefined)).pipe(
      map((value: string) => (value ? this.decrypt(value) : undefined)),
      map((decryptedValue: string) => this.mapValue(decryptedValue))
    );
  }

  public set<T>(key: string, value: T): Observable<T> {
    return of(value).pipe(
      map((data: any) => (typeof data === 'string' ? data : JSON.stringify(data))),
      map((data: string) => this.encrypt(data)),
      switchMap((data: string) => this.secureStorage.set(`${PREFIX}_${key}`, data)),
      mapTo(value)
    );
  }

  public remove<T>(key: string): Observable<T> {
    return this.get<T>(key).pipe(
      switchMap((value: T) =>
        from(this.secureStorage.remove(`${PREFIX}_${key}`)).pipe(map(() => value))
      )
    );
  }

  public keys(): Observable<string[]> {
    return from(this.secureStorage.keys());
  }

  private init(): void {
    this.secureStorage = new Storage(
      {
        name: '_ionicsecure_' + this.identifier,
        driverOrder: ['sqlite', 'indexeddb', 'localstorage'],
      },
      this.platformId
    );

    this.secret = Base64.parse(
      this.deviceId.substr(0, 30) + this.secureStorageKey.substr(0, 30)
    ).toString();

    this.secureStorage.ready().then(() => {
      this.readyObservable.next();
    });
  }

  public decrypt(value: string): string {
    const data = AES.decrypt(value, this.secret);

    return data.toString(Utf8);
  }

  public encrypt(value: string): string {
    const cipherData = AES.encrypt(value, this.secret);

    return cipherData.toString();
  }

  private mapValue<T>(value: any): T {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
