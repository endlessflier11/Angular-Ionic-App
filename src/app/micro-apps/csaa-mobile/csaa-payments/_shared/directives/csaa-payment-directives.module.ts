import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteConfirmDirective } from './delete-confirm/delete-confirm.directive';

const DIRECTIVES = [DeleteConfirmDirective];

@NgModule({
  declarations: [...DIRECTIVES],
  exports: [...DIRECTIVES],
  imports: [CommonModule],
})
export class CsaaPaymentDirectivesModule {}
