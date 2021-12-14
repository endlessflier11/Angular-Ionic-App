import { NgModule } from '@angular/core';
import { AngularHttpAdapter } from './services/http/adapters/angular-http.adapter';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicHttpAdapter } from './services/http/adapters/ionic-http.adapter';
import { HTTP } from '@ionic-native/http/ngx';
import { UNI_HTTP_ADAPTER } from './services/http/uni-http.model';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    HTTP,
    { provide: UNI_HTTP_ADAPTER, multi: true, useClass: AngularHttpAdapter, deps: [HttpClient] },
    {
      provide: UNI_HTTP_ADAPTER,
      multi: true,
      useClass: IonicHttpAdapter,
      deps: [HTTP],
    },
  ],
  exports: [HttpClientModule],
})
export class CsaaHttpClientModule {}
