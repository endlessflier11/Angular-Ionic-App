import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsaaCommonModule } from './csaa-common.module';
import { CsaaStoreModule } from '../_core/store/csaa-store.module';

@NgModule({
  imports: [CommonModule, CsaaCommonModule, CsaaStoreModule],
  exports: [CsaaCommonModule],
  providers: [],
})
export class CsaaCoreModule {
  constructor(@Optional() @SkipSelf() parentModule?: CsaaCoreModule) {
    if (parentModule) {
      throw new Error('CsaaCoreModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders<CsaaCoreModule> {
    return {
      ngModule: CsaaCoreModule,
    };
  }
}
