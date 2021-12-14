import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class PlatformService {
  constructor(private readonly platform: Platform) {}

  public isBrowser(): boolean {
    return !this.platform.is('capacitor');
  }

  public isNative(): boolean {
    return !this.isBrowser();
  }

  public isIos(): boolean {
    return this.platform.is('ios');
  }

  public isAndroid(): boolean {
    return this.platform.is('android');
  }

  public ready() {
    return this.platform.ready();
  }
}
