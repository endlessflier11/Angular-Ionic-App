import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaymentAccount, WalletDetails } from '../../../../_core/interfaces';

@Component({
  selector: 'csaa-card-group-payment-method',
  templateUrl: './card-group-payment-method.component.html',
  styleUrls: ['./card-group-payment-method.component.scss'],
})
export class CardGroupPaymentMethodComponent implements OnInit {
  @Input() wallet: WalletDetails;
  @Input() methodSelected: string;
  @Output() methodSelectedChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<PaymentAccount>();
  @Output() addNew = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onMethodChange(event) {
    this.methodSelected = event?.detail?.value;
    this.methodSelectedChange.emit(this.methodSelected);
    console.log('Method Change', { value: this.methodSelected });
  }

  onClickEditPaymentAccount(paymentAccount) {
    console.log('onClickEditPaymentAccount(paymentAccount)', paymentAccount);
    this.edit.emit(paymentAccount);
  }
}
