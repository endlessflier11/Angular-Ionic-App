import { Component, Input, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { PolicyType } from '../../_core/interfaces';
import {
  BILLING_AND_PAYMENTS_GROUP,
  POLICY_DOCUMENTS_GROUP,
  PolicyDocumentType,
} from '../../_core/interfaces/document.interface';
import { ConfigService } from '../../_core/services/config/config.service';
import { noop } from '../../_core/helpers';

@Component({
  selector: 'csaa-document-modal',
  templateUrl: './document-modal.component.html',
  styleUrls: ['./document-modal.component.scss'],
})
export class DocumentModalComponent implements OnInit {
  @Input() currentFilter: string[] = [];
  @Input() policyType: PolicyType;
  @Input() activeFilter: string;

  currentTheme = '';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyDocumentType = PolicyDocumentType;
  hasPolicyTypes = null;
  hasBillingPaymentTypes = null;

  constructor(private modalCtrl: ModalController, private configService: ConfigService) {}

  ngOnInit() {
    this.currentTheme = this.configService.getTheme();
  }

  checkPolicyTypes() {
    if (this.hasPolicyTypes === null) {
      this.currentFilter.forEach((f) => {
        this.hasPolicyTypes =
          this.hasPolicyTypes || POLICY_DOCUMENTS_GROUP.indexOf(PolicyDocumentType[f]) >= 0;
      });
    }
    return this.hasPolicyTypes;
  }

  checkBillingPayments() {
    if (this.hasBillingPaymentTypes === null) {
      this.currentFilter.forEach((f) => {
        this.hasBillingPaymentTypes =
          this.hasBillingPaymentTypes ||
          BILLING_AND_PAYMENTS_GROUP.indexOf(PolicyDocumentType[f]) >= 0;
      });
    }
    return this.hasBillingPaymentTypes;
  }

  onFilterChange(event) {
    this.activeFilter = event?.detail?.value;
  }

  dismissModal() {
    this.modalCtrl.dismiss(this.activeFilter).then(noop);
  }

  backButtonClick() {
    this.modalCtrl.dismiss(null).then(noop);
  }
}
