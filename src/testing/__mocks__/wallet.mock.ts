import { deepCopy } from '@app/testing';

const WALLET = {
  walletId: '5557',
  ownerId: '02FA1E8C-53A2-49CC-9F64-FEE0DB5FFDA1',
  paymentAccounts: [
    {
      paymentAccountToken: 'BD5743A3-65DB-867F-D9B2-B8764E30C937',
      isPreferred: true,
      shortName: 'Check',
      account: {
        number: '5601',
        type: 'Checking',
        holderName: 'Test Account',
        institution: {
          shortName: 'AVIDIA BANK',
          fullName: 'AVIDIA BANK',
          routingNumber: '211370396',
        },
      },
      card: null,
    },
    {
      paymentAccountToken: 'DD0F1850-E005-6231-C96D-6A27E487E424',
      isPreferred: false,
      shortName: 'Test debit 4595',
      account: null,
      card: {
        type: 'VISA',
        isDebitCard: true,
        last4digits: '4595',
        holderName: 'Jacob Bell',
        printedName: 'Jacob Bell',
        expirationDate: '2020-10-01',
        zipCode: '86001',
      },
    },
    {
      paymentAccountToken: '49AE3D96-9F22-D5AD-4F3E-7F60B1AC88A7',
      isPreferred: false,
      shortName: 'Testdebit 7156',
      account: null,
      card: {
        type: 'DISC',
        isDebitCard: true,
        last4digits: '7156',
        holderName: 'John Doe',
        printedName: 'John Doe',
        expirationDate: '2023-04-01',
        zipCode: '91913',
      },
    },
    {
      paymentAccountToken: 'C0B887C6-70C3-6194-1F2B-AC9E6906AE38',
      isPreferred: false,
      shortName: 'Anex test 3481',
      account: null,
      card: {
        type: 'AMEX',
        isDebitCard: false,
        last4digits: '3481',
        holderName: 'John Doe',
        printedName: 'John Doe',
        expirationDate: '2020-09-01',
        zipCode: '91914',
      },
    },
    {
      paymentAccountToken: '0AC5D0B0-5383-BBB2-6EF6-0E7C35B81E7D',
      isPreferred: false,
      shortName: 'Test CC 5454',
      account: null,
      card: {
        type: 'MASTR',
        isDebitCard: false,
        last4digits: '5454',
        holderName: 'TEST USER',
        printedName: 'TEST USER',
        expirationDate: '2025-12-01',
        zipCode: '86001',
      },
    },
  ],
};

export class WalletResponseMock {
  private readonly model: { [key: string]: any };
  public static create() {
    return new WalletResponseMock();
  }

  constructor() {
    this.model = deepCopy(WALLET);
  }

  public toJson() {
    return deepCopy(this.model);
  }
}
