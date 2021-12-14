import { Injectable } from '@angular/core';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { IndentedCoverageDetails } from '../interfaces/policy.interface';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class GlobalStateService {
  private paymentsTesting: boolean;
  private standaloneApp = false;
  private indentedCoverageDetailState = null;

  constructor() {
    this.resetState();
  }

  resetState() {
    this.indentedCoverageDetailState = null;
  }

  getPaymentsTesting() {
    return !!this.paymentsTesting;
  }

  getIsStandalone() {
    return this.standaloneApp;
  }

  setPaymentsTesting(testing) {
    this.paymentsTesting = testing;
  }

  setIsStandalone(isStandalone) {
    this.standaloneApp = isStandalone;
  }

  setIndentedCoverageDetailsState(state: IndentedCoverageDetails) {
    return (this.indentedCoverageDetailState = state);
  }
  getIndentedCoverageDetailsState(): IndentedCoverageDetails {
    return this.indentedCoverageDetailState;
  }
}
