import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SsoLoginPage } from './sso-login.page';
import { ReactiveFormsModule } from '@angular/forms';
import { CsaaSsoLoginRoutingModule } from './csaa-sso-login-routing.module';
import { UiKitsModule } from '../../micro-apps/csaa-mobile/_core/ui-kits/ui-kits.module';

@NgModule({
  declarations: [SsoLoginPage],
  imports: [
    CommonModule,
    IonicModule,
    CsaaSsoLoginRoutingModule,
    ReactiveFormsModule,
    UiKitsModule,
  ],
})
export class CsaaSsoLoginModule {}
