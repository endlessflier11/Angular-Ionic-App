import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { CardIO } from '@ionic-native/card-io/ngx';
import { SecureStorageEcho } from '@ionic-native/secure-storage-echo/ngx';

@NgModule({
  imports: [CommonModule],
  providers: [FileOpener, File, CardIO, SecureStorageEcho],
})
export class CsaaCommonModule {
  constructor(@Optional() @SkipSelf() parentModule?: CsaaCommonModule) {
    if (parentModule) {
      throw new Error('CsaaCommonModule is already loaded. Import it in the CsaaCoreModule only');
    }
  }

  static forRoot(): ModuleWithProviders<CsaaCommonModule> {
    return {
      ngModule: CsaaCommonModule,
    };
  }
}
