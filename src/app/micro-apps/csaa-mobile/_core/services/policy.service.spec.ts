/* eslint-disable max-len */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs/internal/observable/of';
import {
  ACTIVE_POLICIES_MOCK,
  AuthMockService,
  MetadataMockService,
  RollbarReporterMockService,
  HttpMockService,
  AnalyticsMockService,
  SINGLE_POLICY_MOCK,
} from '@app/testing';
import { CsaaAppInjector } from '../../csaa-app.injector';
import { EValueEnrollmentStatus, Policy, PolicyStatus, PolicyType } from '../interfaces';
import { DocumentType, ProductType } from '../interfaces/document.interface';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth/auth.service';
import { ErrorService } from './errors.service';
import { GlobalStateService } from './global-state.service';
import { HttpService } from './http/http.service';
import { MetadataService } from './metadata.service';
import { PolicyService } from './policy.service';
import { RollbarReporterService } from './rollbar-reporter/rollbar-reporter.service';

describe('Policy Service', () => {
  let policyService: PolicyService;
  let httpService: HttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PolicyService,
        {
          provide: ErrorService,
          useValue: {
            publishError: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useClass: AuthMockService,
        },
        {
          provide: AnalyticsService,
          useClass: AnalyticsMockService,
        },
        {
          provide: RollbarReporterService,
          useClass: RollbarReporterMockService,
        },
        {
          provide: Store,
          useValue: { dispatch: jest.fn() },
        },
        {
          provide: GlobalStateService,
          useValue: {
            setRegistrationId: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useClass: HttpMockService,
        },
        {
          provide: MetadataService,
          useClass: MetadataMockService,
        },
      ],
    });

    CsaaAppInjector.injector = TestBed.inject(Injector);
    policyService = TestBed.inject(PolicyService);
    httpService = TestBed.inject(HttpService);
  });

  it('should create', () => {
    expect(policyService).toBeTruthy();
  });

  it('should get policy document', async () => {
    httpService.getNamedResource = jest.fn().mockReturnValue(
      of({
        body: [
          {
            externalURI:
              'policy/documentsecure/AAAADJihPt8djfbGD5GqOJb1rLviuse9lMTq1qknD_K8QLUEQ8jS-E7Yfea6jeEhahUZdbdpblQ9X8W5YJ_ZZpQLi4WWphPxMqgd_YlnYbvSRb2kqFen_A/2021-03-17T12:48:47.552714-07:00/d05a86c5dae74beff3d98d2542503526fe2a4ec637cfd8fb913369b17115bfd0',
            docName: 'HS02_4',
            formId: 'HS02_4',
            contentType: 'application/pdf',
            docType: null,
            description: 'Property Declaration Page',
            processDate: '2020-10-09',
            agreementEffectiveDate: '2020-10-09',
            oid: 'b0a84da26b8d1b8d42e747a20f7761a91ee588fc9109626d8045c69811456f66',
          },
        ],
        headers: {
          normalizedNames: {},
          lazyUpdate: null,
        },
      })
    );
    const result = await policyService
      .getPolicyDocument('test', ProductType.Home, DocumentType.InsuranceCard)
      .toPromise();

    expect(result).toEqual({
      agreementEffectiveDate: '2020-10-09',
      description: 'Property Declaration Page',
      docName: 'HS02_4',
      docType: null,
      externalURI:
        'policy/documentsecure/AAAADJihPt8djfbGD5GqOJb1rLviuse9lMTq1qknD_K8QLUEQ8jS-E7Yfea6jeEhahUZdbdpblQ9X8W5YJ_ZZpQLi4WWphPxMqgd_YlnYbvSRb2kqFen_A/2021-03-17T12:48:47.552714-07:00/d05a86c5dae74beff3d98d2542503526fe2a4ec637cfd8fb913369b17115bfd0',
      oid: 'b0a84da26b8d1b8d42e747a20f7761a91ee588fc9109626d8045c69811456f66',
      processDate: '2020-10-09',
      formId: 'HS02_4',
      category: 'Policy Documents',
      contentType: 'application/pdf',
      policyNumber: 'test',
    });
  });

  // it('should get customer policy data', async () => {
  //   const MOCKS = [CUSTOMER_MULTIPLE_POLICIES, MULTIPLE_POLICIES_MOCK];
  //   httpService.postNamedResource = jest.fn().mockImplementation(() => of({ body: MOCKS.shift() }));
  //   const result = await policyService.getInsuredFirstName().pipe(take(1)).toPromise();
  //   expect(result).toEqual(CUSTOMER_MULTIPLE_POLICIES.firstName);
  // });

  it('should parse EValue Enrollment', () => {
    const first = ACTIVE_POLICIES_MOCK[0];
    expect(PolicyService.isEValueEnrolledForPolicy(first)).toBeFalsy();
    first.eValueEnrollment = { status: null };
    expect(PolicyService.isEValueEnrolledForPolicy(first)).toBeFalsy();
    first.eValueEnrollment = { status: EValueEnrollmentStatus.ACTIVE };
    expect(PolicyService.isEValueEnrolledForPolicy(first)).toBeTruthy();
  });

  it('should parse EValue Enrollment', () => {
    const first = SINGLE_POLICY_MOCK;
    let result = PolicyService.parseEValueEnrollment(first as any);
    expect(result).toBeTruthy();
    expect(result.status).toBeNull();

    first.eValueInfo.enrollmentStatus = 'active';
    result = PolicyService.parseEValueEnrollment(first as any);
    expect(result).toBeTruthy();
    expect(result.status).toEqual(EValueEnrollmentStatus.ACTIVE);

    first.eValueInfo.enrollmentStatus = 'pending';
    result = PolicyService.parseEValueEnrollment(first as any);
    expect(result).toBeTruthy();
    expect(result.status).toEqual(EValueEnrollmentStatus.PENDING);

    first.eValueInfo = null;
    result = PolicyService.parseEValueEnrollment(first as any);
    expect(result).toBeNull();
  });

  it('should return a policy document', () => {
    const policy = {
      description: 'Property Declaration Page',
      docName: 'HS02_4',
      docType: null,
      externalURI:
        'policy/documentsecure/AAAADJihPt8djfbGD5GqOJb1rLviuse9lMTq1qknD_K8QLUEQ8jS-E7Yfea6jeEhahUZdbdpblQ9X8W5YJ_ZZpQLi4WWphPxMqgd_YlnYbvSRb2kqFen_A/2021-03-17T12:48:47.552714-07:00/d05a86c5dae74beff3d98d2542503526fe2a4ec637cfd8fb913369b17115bfd0',
      processDate: '2020-10-09',
    };

    expect(PolicyService.mapPolicyDocument(policy as any, 'test')).toBeTruthy();
  });

  it('should subtitle for policy', () => {
    const policy: Policy = {
      id: '123456',
      subtitle: null,
      number: '123',
      status: PolicyStatus.ACTIVE,
      riskState: 'test',
      productCode: '12345',
      type: null,
      vehicles: [
        {
          id: '123456',
          name: 'Jetta',
          vin: '1234567',
          riskFactors: null,
          coverages: [],
        },
      ],
      address: '1405 test address',
      policyPrefix: 'AU_SS',
    };
    policy.type = PolicyType.PUP;
    expect(policyService.buildSubtitleForPolicy(policy)).toEqual('Personal Umbrella Policy');
    policy.type = PolicyType.Auto;
    expect(policyService.buildSubtitleForPolicy(policy)).toEqual('Jetta');
    policy.type = PolicyType.Home;
    expect(policyService.buildSubtitleForPolicy(policy)).toEqual('1405 test address');
  });
});
