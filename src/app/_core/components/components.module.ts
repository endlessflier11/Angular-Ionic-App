import { NgModule } from '@angular/core';
import { DevOptionsComponent } from './dev-options/dev-options.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const COMPONENTS = [DevOptionsComponent];

@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ComponentsModule {}
