import {
  AutoPayEnrollmentResponse,
  PaymentAccount,
  PaymentAccountType,
  PaymentAccountLabel,
  PaymentBankAccountType,
} from '../interfaces';

export class PaymentHelper {
  static getAutopayEnrollmentLabel(enrollment: AutoPayEnrollmentResponse): string {
    if (
      !enrollment ||
      !enrollment.enrollmentRecord.paymentItem ||
      !enrollment.enrollmentRecord.paymentItem
    ) {
      return '';
    }
    const { paymentMethod, card, account } = enrollment.enrollmentRecord.paymentItem;
    switch (paymentMethod) {
      case PaymentAccountType.CARD:
        return `Card ending in ${(!!card && card.number) || '****'}`;
      case PaymentAccountType.EFT:
        return `Account ending in ${(!!account && account.accountNumber) || '****'}`;
      default:
        return '';
    }
  }

  static getPaymentAccountLabel(account: PaymentAccount): PaymentAccountLabel {
    return !!account.card
      ? PaymentHelper.getPaymentAccountLabelForCard(account.card.last4digits)
      : PaymentHelper.getPaymentAccountLabelForEFT(account.account.accountNumber);
  }

  static getPaymentAccountLabelForEFT(last4: string): PaymentAccountLabel {
    const label: PaymentAccountLabel = {
      primaryText: last4,
      secondaryText: 'Account',
      text: '',
    };
    label.text = [label.primaryText, label.secondaryText].join(' ');
    return label;
  }

  static getPaymentAccountLabelForCard(last4: string): PaymentAccountLabel {
    const label: PaymentAccountLabel = {
      primaryText: (last4 || '').substr(-4),
      secondaryText: 'Card',
      text: '',
    };
    label.text = [label.primaryText, label.secondaryText].join(' ');
    return label;
  }

  static getAutoPayEnrollmentPaymentMethod(enrollment: AutoPayEnrollmentResponse) {
    const isCard =
      enrollment.enrollmentRecord &&
      enrollment.enrollmentRecord.paymentItem &&
      enrollment.enrollmentRecord.paymentItem.card;
    if (isCard) {
      return enrollment.enrollmentRecord.paymentItem.card.type;
    } else if (
      enrollment.enrollmentRecord.paymentItem.account.type === PaymentBankAccountType.CHECKING
    ) {
      return 'checking';
    } else {
      return 'savings';
    }
  }
}
