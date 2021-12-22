import { Component, Input } from '@angular/core';
import { PaymentAccount } from '../../../../_core/interfaces';

@Component({
  selector: 'csaa-icon-payment-method',
  templateUrl: './icon-payment-method.component.html',
  styleUrls: ['./icon-payment-method.component.scss'],
})
export class IconPaymentMethodComponent {
  @Input() paymentAccount: PaymentAccount;

  generateIconSrc(account: PaymentAccount): string {
    const iconName: string = !account?.card ? 'bank' : account?.card?.type;
    return `/assets/csaa-mobile/vectors/${iconName}.svg`;
  }
}
