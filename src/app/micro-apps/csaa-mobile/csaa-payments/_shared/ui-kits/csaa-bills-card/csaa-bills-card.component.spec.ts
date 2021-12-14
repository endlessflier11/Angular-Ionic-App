import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaBillsCardComponent } from './csaa-bills-card.component';
import { CommonModule } from '@angular/common';
import { UiKitsModule } from '../../../../_core/ui-kits/ui-kits.module';
import { By, PageTestingModule, StoreTestBuilder } from '@app/testing';
import { CsaaPaymentsUiKitsModule } from '../csaa-payments-ui-kits.module';
import { Store } from '@ngxs/store';
import { add, format, parse } from 'date-fns';
import { AutoPayEnrollmentResponse } from '../../../../_core/interfaces';
import { PolicyDocument } from '../../../../_core/interfaces/document.interface';

describe('CsaaBillsCardComponent', () => {
  const transactionDate = parse('2021-01-27', 'yyyy-MM-dd', new Date());
  const policyNumber = 'CAAC910026006';

  let component: CsaaBillsCardComponent;
  let fixture: ComponentFixture<CsaaBillsCardComponent>;
  let store: Store;

  const setupComponent = (beforeComponentCreate?: () => void) => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        IonicModule,
        UiKitsModule,
        CsaaPaymentsUiKitsModule,
        PageTestingModule.withConfig({
          providesAnalytics: true,
          providesStorage: true,
          providesConfig: true,
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);

    beforeComponentCreate && beforeComponentCreate.call(beforeComponentCreate);

    fixture = TestBed.createComponent(CsaaBillsCardComponent);
    component = fixture.componentInstance;
    component.bills = [
      {
        amount: '23.50',
        billedTo: 'JEAN BRANDOS',
        dueDate: format(transactionDate, 'yyyy-MM-dd'), // '2021-03-09',
        paymentPlan: 'standardHO',
        policyEffectiveDate: '2020-09-09',
        policyExpirationDate: '2021-09-09',
        policyNumber,
        policyType: 1,
        priorBalance: '0.00',
        referenceNumber: '130081',
        subtitle: '610 N 1st St',
        totalAmountDue: '119.50',
        transactionDate: '2021-01-27',
      },
    ];
    component.autoPayEnrollmentStatusMap = {};
    component.isPaidInFullStatusMap = {};
    component.availableDocumentsMap = {};
    fixture.detectChanges();
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    setupComponent();
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    setupComponent();
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(transactionDate));
    component.availableDocumentsMap = {
      [policyNumber]: [
        {
          processDate: format(transactionDate, 'yyyy-MM-dd'),
          docName: 'Installment Bill',
        } as PolicyDocument,
      ],
    };
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  describe('AutoPay Not Enrolled', () => {
    it('should match snapshot >> before one calendar month of transaction not paid in full', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(add(transactionDate, { days: 25 }).getTime()));

      setupComponent(() => {
        StoreTestBuilder.withDefaultMocks()
          .patchCustomerPaymentDataAtIndex(0, { remainingPremium: 5000 })
          .resetStateOf(store);
      });

      component.isPaidInFullStatusMap = {
        [policyNumber]: false,
      };
      component.availableDocumentsMap = {
        [policyNumber]: [
          {
            processDate: format(transactionDate, 'yyyy-MM-dd'),
            docName: 'Installment Bill',
          } as PolicyDocument,
        ],
      };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.cssAndText('ion-card', policyNumber))).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    });

    it('should match snapshot >> before one calendar month of transaction and paid in full', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(add(transactionDate, { days: 25 }).getTime()));

      setupComponent(() => {
        StoreTestBuilder.withDefaultMocks()
          .patchCustomerPaymentDataAtIndex(0, { remainingPremium: 0 })
          .resetStateOf(store);
      });

      component.isPaidInFullStatusMap = {
        [policyNumber]: true,
      };
      component.availableDocumentsMap = {
        [policyNumber]: [
          {
            processDate: format(transactionDate, 'yyyy-MM-dd'),
            docName: 'Installment Bill',
          } as PolicyDocument,
        ],
      };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.cssAndText('ion-card', policyNumber))).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    });

    it('should match snapshot >> after one calendar month of transaction and paid in full', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(add(transactionDate, { months: 1 }).getTime()));

      setupComponent(() => {
        StoreTestBuilder.withDefaultMocks()
          .patchCustomerPaymentDataAtIndex(0, { remainingPremium: 0 })
          .resetStateOf(store);
      });

      component.isPaidInFullStatusMap = {
        [policyNumber]: true,
      };
      component.availableDocumentsMap = {
        [policyNumber]: [
          {
            processDate: format(add(transactionDate, { months: 1 }), 'yyyy-MM-dd'),
            docName: 'Installment Bill',
          } as PolicyDocument,
        ],
      };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.cssAndText('ion-card', policyNumber))).toBeFalsy();
      expect(fixture).toMatchSnapshot();
    });

    it('should match snapshot >> after one calendar month of transaction and not paid in full', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(add(transactionDate, { months: 1 })));

      setupComponent(() => {
        StoreTestBuilder.withDefaultMocks()
          .patchCustomerPaymentDataAtIndex(0, { remainingPremium: 5000 })
          .resetStateOf(store);
      });

      component.isPaidInFullStatusMap = {
        [policyNumber]: false,
      };
      component.availableDocumentsMap = {
        [policyNumber]: [
          {
            processDate: format(new Date(), 'yyyy-MM-dd'),
            docName: 'Installment Bill',
          } as PolicyDocument,
          // {processDate: format(transactionDate, 'yyyy-MM-dd'), docName: 'Installment Bill'} as PolicyDocument
        ],
      };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.cssAndText('ion-card', policyNumber))).toBeTruthy();
      expect(fixture).toMatchSnapshot();
    });
  });

  describe('AutoPay Enrolled', () => {
    it('should match snapshot >> after one calendar month of transaction and paid in full', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(add(transactionDate, { months: 1 }).getTime()));

      setupComponent(() => {
        StoreTestBuilder.withDefaultMocks()
          .patchCustomerPaymentDataAtIndex(0, { remainingPremium: 5000 })
          .resetStateOf(store); // recipe for hide --- (1)
      });

      component.autoPayEnrollmentStatusMap = {
        [policyNumber]: { autoPay: true } as unknown as AutoPayEnrollmentResponse,
      };
      component.isPaidInFullStatusMap = {
        [policyNumber]: true, // recipe for hide --- (2)
      };
      component.availableDocumentsMap = {
        [policyNumber]: [
          {
            externalURI: 'policy/documentsecure/AAAA...',
            docName: 'Auto Pay Schedule',
            docType: 'payment',
            description: 'Auto Pay Schedule',
            processDate: '2020-10-09',
            agreementEffectiveDate: '2020-10-09',
            oid: 'b0a84da26b8d1b8d42e74...',
          } as PolicyDocument,
        ],
      };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.cssAndText('ion-card', policyNumber))).toBeTruthy(); // but shown --- (3)
      expect(fixture).toMatchSnapshot();
    });
    it('should match screenshot if payment plan is mortgageeHO', () => {
      component.bills = [
        {
          amount: '23.50',
          billedTo: 'JEAN BRANDOS',
          dueDate: '2021-03-09',
          paymentPlan: 'mortgageeHO',
          policyEffectiveDate: '2020-09-09',
          policyExpirationDate: '2021-09-09',
          policyNumber: 'MTH4910017142',
          policyType: 1,
          priorBalance: '0.00',
          referenceNumber: '130081',
          subtitle: '610 N 1st St',
          totalAmountDue: '119.50',
          transactionDate: '2021-01-27',
        },
      ];
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });
});
