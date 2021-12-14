import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CsaaAppRoutingModule } from './csaa-app-routing.module';
import { CsaaHttpClientModule } from './_core/csaa-http-client.module';
import { CsaaAppInjector } from './csaa-app.injector';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CsaaAppRoutingModule,
    CsaaHttpClientModule, // We need this for our micro app to standalone (when parent doesn't import it)
  ],
  providers: [CsaaAppInjector],
})
export class CsaaAppModule {
  constructor(private readonly injector: Injector) {
    CsaaAppInjector.injector = this.injector;
  }
}
