/* eslint-disable max-len */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CsaaDocumentsPageComponent } from './csaa-documents-page.component';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { PdfDisplayService, PolicyService } from '../../_core/services';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { of } from 'rxjs';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { Injector } from '@angular/core';

describe('CsaaDocumentsPageComponent', () => {
  let component: CsaaDocumentsPageComponent;
  let fixture: ComponentFixture<CsaaDocumentsPageComponent>;
  let store: Store;
  const PARAM_MAP = new Map();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CsaaDocumentsPageComponent],
      imports: [
        IonicModule,
        UiKitsModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesAnalytics: true,
          providesConfig: true,
          providesRouter: true,
        }),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(PARAM_MAP),
          },
        },
        { provide: PdfDisplayService, useValue: { viewPdf: jest.fn() } },
        {
          provide: PolicyService,
          useValue: { getDocumentsForPolicy: jest.fn().mockReturnValue(of([])) },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    CsaaAppInjector.injector = TestBed.inject(Injector);

    PARAM_MAP.set('policyNumber', 'CAAC910026006');
    PARAM_MAP.set('policyType', '2');

    fixture = TestBed.createComponent(CsaaDocumentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load documents data', () => {
    // TODO: FIX THIS DOCUMENTS SELECTION FROM STORE
    component.documents$ = of([
      {
        agreementEffectiveDate: '2020-07-21',
        category: 'Policy Documents',
        contentType: 'application/pdf',
        current: true,
        description: 'Property Declaration Page',
        docName: 'Property Declaration Page',
        docType: 'DeclarationsPage',
        externalURI:
          'policy/documentsecure/AAAADHIsGr6kQ-NZzYA3lEZqh0lk-qegJO8E9weR4ZvWAWwRYYXN2tOelxBjBEzaGkRdnB6govDWcDtGn1Y3javHNruvTFuD2nNB7Wg2eB5CYCv1SIrxAg/2021-06-01T14:06:42.691154-07:00/bd29bd470e54c9578321fc464594b075f3b38e0e2924d8e5113c061a317dd1e5',
        formId: 'HS02_4',
        isNew: false,
        oid: '6fa2a3fe3f96875948e9033ab109c5c91a70adbf35828d85fb7f379b98b71a61',
        policyNumber: 'WYH4910013941',
        processDate: '2020-09-08',
      },
      {
        agreementEffectiveDate: '2020-07-21',
        category: 'Policy Documents',
        contentType: 'application/pdf',
        current: true,
        description: 'Property Declaration Page',
        docName: 'Property Declaration Page',
        docType: 'DeclarationsPage',
        externalURI:
          'policy/documentsecure/AAAADHPLdLr3BP43aXcBusxPpW-GaGZBIawINmmzRMhvu0if2aPyq3jmShacNT07hNxHzN9uu6ydcc0iINH6yoi9yFlkSm-PkfaPn0UxWjreQeSxzrv2Vw/2021-06-01T14:06:42.692028-07:00/cc860e52960ac340931a535eeba2143e5603d9faa3b209a65bd021d93e7de39c',
        formId: 'HS02_4',
        isNew: false,
        oid: 'bf00c590069554cb09d67925577a3aa25eda3831ba948a09a9cc252d49502371',
        policyNumber: 'WYH4910013941',
        processDate: '2020-09-08',
      },
    ]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
