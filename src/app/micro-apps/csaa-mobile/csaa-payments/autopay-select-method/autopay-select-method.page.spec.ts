/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By, CONFIG_STATE_FIXTURE_MOCK, PageTestingModule } from '@app/testing';
import { AutopaySelectMethodPage } from './autopay-select-method.page';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { CsaaPaymentsUiKitsModule } from '../_shared/ui-kits/csaa-payments-ui-kits.module';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';
import { NgxsModule, Store } from '@ngxs/store';
import { AppState } from '../../../../_core/store';
import { Policy, PolicyStatus } from '../../_core/interfaces';

describe('AutopaySelectMethodPage', () => {
  let component: AutopaySelectMethodPage;
  let fixture: ComponentFixture<AutopaySelectMethodPage>;

  beforeEach(async(() => {
    const PARAM_MAP = new Map();
    PARAM_MAP.set('policyNumber', 'demo');
    TestBed.configureTestingModule({
      declarations: [AutopaySelectMethodPage],
      imports: [
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesConfig: true,
          providesRouter: true,
        }),
        NgxsModule.forRoot([AppState]),
      ],
      providers: [
        MakePaymentService,
        { provide: ActivatedRoute, useValue: { paramMap: of(PARAM_MAP) } },
      ],
    }).compileComponents();
    const store = TestBed.inject(Store);
    store.reset({
      __csaa_app: {
        ...store.snapshot().__csaa_app,
        config: CONFIG_STATE_FIXTURE_MOCK,
      },
    });
    CsaaAppInjector.injector = TestBed.inject(Injector);
    fixture = TestBed.createComponent(AutopaySelectMethodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a snapshot', () => {
    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: '1234',
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };
    component.policy = mockPolicy;
    component.policyNumber = '1234567';
    component.wallet = {
      ownerId: '12345',
      walletId: '54321',
      paymentAccounts: [
        {
          account: {
            institution: {
              routingNumber: '123456',
            },
            accountNumber: '12345',
            holderName: 'Jane Doe',
            type: 'Checking',
            bankAccountType: 'Checking',
          },
          card: {
            holderName: 'Jane Doe',
            type: 'Debit',
            last4digits: '1111',
            printedName: 'Jane Doe',
            zipCode: '12345',
            expirationDate: '10/24',
            expired: false,
            isDebitCard: true,
          },
          isPreferred: true,
          paymentAccountToken: '1234567',
          shortName: 'test',
        },
      ],
    };
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display the Credit or Debit Card payment method', () => {
    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: '1234',
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };
    component.policy = mockPolicy;
    component.policyNumber = '1234567';
    component.wallet = {
      ownerId: '12345',
      walletId: '54321',
      paymentAccounts: [
        {
          account: {
            institution: {
              routingNumber: '123456',
            },
            accountNumber: '12345',
            holderName: 'Jane Doe',
            type: 'Checking',
            bankAccountType: 'Checking',
          },
          card: {
            holderName: 'Jane Doe',
            type: 'Debit',
            last4digits: '1111',
            printedName: 'Jane Doe',
            zipCode: '12345',
            expirationDate: '10/24',
            expired: false,
            isDebitCard: true,
          },
          isPreferred: true,
          paymentAccountToken: '1234567',
          shortName: 'test',
        },
      ],
    };
    const creditOrDebitCardButton = fixture.debugElement.query(
      By.cssAndText('ion-item', 'Credit or Debit Card')
    );
    expect(creditOrDebitCardButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display the Checking Account method', () => {
    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: '1234',
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };
    component.policy = mockPolicy;
    component.policyNumber = '1234567';
    component.wallet = {
      ownerId: '12345',
      walletId: '54321',
      paymentAccounts: [
        {
          account: {
            institution: {
              routingNumber: '123456',
            },
            accountNumber: '12345',
            holderName: 'Jane Doe',
            type: 'Checking',
            bankAccountType: 'Checking',
          },
          card: {
            holderName: 'Jane Doe',
            type: 'Debit',
            last4digits: '1111',
            printedName: 'Jane Doe',
            zipCode: '12345',
            expirationDate: '10/24',
            expired: false,
            isDebitCard: true,
          },
          isPreferred: true,
          paymentAccountToken: '1234567',
          shortName: 'test',
        },
      ],
    };
    const checkingAccountButton = fixture.debugElement.query(
      By.cssAndText('ion-item', 'Checking Account')
    );
    expect(checkingAccountButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display the Savings Account method', () => {
    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: '1234',
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };
    component.policy = mockPolicy;
    component.policyNumber = '1234567';
    component.wallet = {
      ownerId: '12345',
      walletId: '54321',
      paymentAccounts: [
        {
          account: {
            institution: {
              routingNumber: '123456',
            },
            accountNumber: '12345',
            holderName: 'Jane Doe',
            type: 'Checking',
            bankAccountType: 'Checking',
          },
          card: {
            holderName: 'Jane Doe',
            type: 'Debit',
            last4digits: '1111',
            printedName: 'Jane Doe',
            zipCode: '12345',
            expirationDate: '10/24',
            expired: false,
            isDebitCard: true,
          },
          isPreferred: true,
          paymentAccountToken: '1234567',
          shortName: 'test',
        },
      ],
    };
    const savingsAccountButton = fixture.debugElement.query(
      By.cssAndText('ion-item', 'Savings Account')
    );
    expect(savingsAccountButton).toBeTruthy();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should click on the cancel button', () => {
    const mockPolicy: Policy = {
      type: 2,
      id: '1',
      subtitle: '2018 Porsche 911',
      number: '1234',
      status: PolicyStatus.ACTIVE,
      riskState: 'AZ',
      productCode: '1',
      policyPrefix: 'AU_SS',
    };
    component.policy = mockPolicy;
    component.policyNumber = '1234567';
    component.wallet = {
      ownerId: '12345',
      walletId: '54321',
      paymentAccounts: [
        {
          account: {
            institution: {
              routingNumber: '123456',
            },
            accountNumber: '12345',
            holderName: 'Jane Doe',
            type: 'Checking',
            bankAccountType: 'Checking',
          },
          card: {
            holderName: 'Jane Doe',
            type: 'Debit',
            last4digits: '1111',
            printedName: 'Jane Doe',
            zipCode: '12345',
            expirationDate: '10/24',
            expired: false,
            isDebitCard: true,
          },
          isPreferred: true,
          paymentAccountToken: '1234567',
          shortName: 'test',
        },
      ],
    };
    const editButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Cancel'));
    expect(editButton).toBeTruthy();
    editButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
