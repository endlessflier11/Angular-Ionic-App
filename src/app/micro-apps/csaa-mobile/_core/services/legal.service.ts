import { Injectable } from '@angular/core';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { ResponseType } from '../interfaces/http.interface';
import { HttpService } from './http/http.service';
import { AppEndpointsEnum } from '../interfaces';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class LegalService {
  constructor(private httpService: HttpService) {}

  loadPaymentTerms() {
    return this.httpService.getNamedResource<string>(AppEndpointsEnum.contentLegal, {
      responseType: ResponseType.TEXT,
      routeParams: {
        contentName: 'csaaigOTPTermsAndConds',
      },
    });
  }

  loadAutopayTerms() {
    return this.httpService.getNamedResource<string>(AppEndpointsEnum.contentLegal, {
      responseType: ResponseType.TEXT,
      routeParams: {
        contentName: 'csaaigAutoPayTermsAndConds',
      },
    });
  }

  loadPaperlessTerms() {
    return this.httpService.getNamedResource<string>(AppEndpointsEnum.contentLegal, {
      responseType: ResponseType.TEXT,
      routeParams: {
        contentName: 'csaaigPaperlessTermsAndConds',
      },
    });
  }
}
