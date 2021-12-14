import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { LegalService } from '../../../../_core/services/legal.service';
import { noop, Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../../../_core/store/states/config.state';

@Component({
  selector: 'csaa-payment-terms-conditions',
  templateUrl: './payment-terms-conditions.component.html',
  styleUrls: ['./payment-terms-conditions.component.scss'],
})
export class PaymentTermsConditionsComponent {
  currentTheme: string;
  source$: Observable<string>;

  constructor(
    private readonly store: Store,
    private legalService: LegalService,
    private modalCtrl: ModalController
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.source$ = this.legalService.loadPaymentTerms().pipe(map(({ body }) => body));
  }

  dismissModal() {
    this.modalCtrl.dismiss().then(noop);
  }
}
