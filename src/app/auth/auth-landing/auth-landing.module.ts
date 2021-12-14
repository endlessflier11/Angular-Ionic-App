import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthLandingPage } from './auth-landing-page.component';
import { IonicModule } from '@ionic/angular';
import { AuthLandingRoutingModule } from './auth-landing-routing.module';

@NgModule({
  declarations: [AuthLandingPage],
  imports: [CommonModule, RouterModule, IonicModule, AuthLandingRoutingModule],
})
export class AuthLandingModule {}
