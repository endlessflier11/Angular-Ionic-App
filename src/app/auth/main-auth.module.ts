import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAuthRoutingModule } from './main-auth-routing.module';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, MainAuthRoutingModule],
})
export class MainAuthModule {}
