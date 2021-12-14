import { Injectable } from '@angular/core';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class CallService {
  call(phoneNumber: string) {
    if (phoneNumber) {
      phoneNumber = phoneNumber.replace(/ ?x/, ';ext=');
      // This one is working on both IOS and Android in MWG integrated build
      window.location.assign('tel:' + encodeURI(phoneNumber));
    }
  }
}
