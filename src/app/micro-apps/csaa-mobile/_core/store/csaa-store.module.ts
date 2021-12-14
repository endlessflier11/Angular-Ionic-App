import { NgModule } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NgxsModule } from '@ngxs/store';
import { CSAA_STORES } from './state';

@NgModule({
  imports: [
    NgxsModule.forRoot(CSAA_STORES, {
      developmentMode: !environment.production,
    }),
    NgxsModule.forFeature(CSAA_STORES),
  ],
})
export class CsaaStoreModule {}
