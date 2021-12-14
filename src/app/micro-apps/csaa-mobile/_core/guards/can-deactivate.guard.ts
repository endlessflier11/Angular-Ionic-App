import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { CanComponentDeactivate } from '../interfaces';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class CsaaCanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
