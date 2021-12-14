import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { STORAGE_KEY } from './storage.keys';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../store/states/config.state';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { CsaaSecureStorageService } from './csaa-secure-storage.service';
import { Device } from '@capacitor/device';
import { PlatformService } from '../platform.service';

export interface StorageApi {
  get(key: string): Promise<any>;
  set(key: string, value: string): Promise<any>;
  remove(key: string): Promise<any>;
}

@Injectable({
  providedIn: CsaaCommonModule,
})
export class StorageService {
  public static KEY = STORAGE_KEY;
  private ready$: BehaviorSubject<StorageApi> = new BehaviorSubject<StorageApi>(null);
  private secureStorage: CsaaSecureStorageService;
  constructor(
    private store: Store,
    private readonly platformService: PlatformService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.store
      .select(ConfigState.configLoaded)
      .pipe(
        filter((n) => n),
        take(1)
      )
      .subscribe(async () => {
        const deviceUuid$ = this.platformService.isNative()
          ? from(
              Device.getId()
                .then((deviceId) => deviceId.uuid)
                .catch(() => '127.0.0.1')
            )
          : of('127.0.0.1');

        const deviceUuid = await deviceUuid$.toPromise();
        this.secureStorage = new CsaaSecureStorageService(
          this.platformId,
          'CSAA',
          deviceUuid,
          STORAGE_KEY.STORAGE_NAME
        );

        this.secureStorage.ready().subscribe(() => {
          this.ready$.next({
            get: (key: string) => this.secureStorage.get(key).toPromise(),
            set: (key: string, value: string) => this.secureStorage.set(key, value).toPromise(),
            remove: (key: string) => this.secureStorage.remove(key).toPromise(),
          });
          console.log('CSAA: STORAGE Ready');
        });
      });
  }

  ready(): Observable<boolean> {
    return this.ready$.asObservable().pipe(
      map((value) => !!value),
      filter((value) => value),
      take(1)
    );
  }

  async get(key: string) {
    return this.ready()
      .toPromise()
      .then(() => this.ready$.getValue().get(key));
  }

  async set(key: string, value: string) {
    await this.ready()
      .toPromise()
      .then(() => this.ready$.getValue().set(key, value));
  }

  async remove(key: string) {
    await this.ready()
      .toPromise()
      .then(() => this.ready$.getValue().remove(key));
  }
}
