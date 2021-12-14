import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { NgxsModule } from '@ngxs/store';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { CsaaCoreModule, CsaaHttpClientModule } from '@csaadigital/mobile-mypolicy';

import { AppState } from './_core/store';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    CsaaHttpClientModule, // Parent app needs this since it's borrowing HttpService from micro app
    CsaaCoreModule.forRoot(),
    NgxsModule.forRoot([AppState], {
      developmentMode: !environment.production,
      selectorOptions: { suppressErrors: false, injectContainerState: false },
    }),
    NgxsLoggerPluginModule.forRoot({
      // Do not log in production mode
      disabled: environment.production,
    }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
