import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { differenceInDays } from 'date-fns';
import { Observable } from 'rxjs';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { CustomerSearchResponse } from '../interfaces/auth.interface';
import {
  Coverage,
  DwellingResponse,
  EValueEnrollment,
  EValueEnrollmentStatus,
  Insured,
  InsuredResponse,
  Policy,
  POLICY_LIMIT_CANCELED_DAYS,
  PolicyPaperlessPreference,
  PolicyPaperlessPreferencesApiResponse,
  PolicyResponse,
  PolicyStatus,
  PolicyType,
} from '../interfaces/policy.interface';
import { PolicyHelper } from '../shared/policy.helper';
import { DriverCoverageType } from '../interfaces/driver.interface';
import { Agent } from '../interfaces/agent.interface';
import { HttpService } from './http/http.service';
import DateHelper from '../shared/date.helper';
import {
  BILLING_AND_PAYMENTS_GROUP,
  DocumentType,
  PolicyDocument,
  PolicyDocumentType,
  ProductType,
} from '../interfaces/document.interface';
import { AppEndpointsEnum } from '../interfaces';
import { MetadataAction } from '../store/actions';
import { Store } from '@ngxs/store';
import { ContactInfoAction } from '../store/actions/contact-info.actions';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class PolicyService {
  static isEValueEnrolledForPolicy(policy: Policy): boolean {
    return (
      policy.eValueEnrollment &&
      (policy.eValueEnrollment.status === EValueEnrollmentStatus.ACTIVE ||
        policy.eValueEnrollment.status === EValueEnrollmentStatus.PENDING)
    );
  }

  static parseEValueEnrollment(policyResponseData: PolicyResponse): EValueEnrollment {
    if (!policyResponseData.eValueInfo || !policyResponseData.eValueInfo.enrollmentStatus) {
      return null;
    }
    const { enrollmentStatus } = policyResponseData.eValueInfo;
    let status = null;
    switch (enrollmentStatus.toLowerCase()) {
      case 'active':
        status = EValueEnrollmentStatus.ACTIVE;
        break;
      case 'pending':
        status = EValueEnrollmentStatus.PENDING;
        break;
    }
    return { status };
  }

  static mapPolicyDocument(data: PolicyDocument, policyNumber: string): PolicyDocument {
    const category =
      BILLING_AND_PAYMENTS_GROUP.indexOf(PolicyDocumentType[data?.docType]) >= 0
        ? 'Billing & Payments'
        : 'Policy Documents';

    return {
      ...data,
      category,
      policyNumber,
    };
  }

  constructor(private store: Store, private httpService: HttpService) {}

  public fetchPaperlessPreferences(
    customer: CustomerSearchResponse
  ): Observable<PolicyPaperlessPreference[]> {
    return this.httpService
      .getNamedResource<PolicyPaperlessPreferencesApiResponse>(
        AppEndpointsEnum.paperlessPreferences,
        {
          params: { policyNumbers: customer.policies.map((p) => p.policyNumber).join(',') },
        }
      )
      .pipe(map((result) => result.body));
  }

  // this is the one used by the store
  public loadData(customer: CustomerSearchResponse): Observable<Policy[]> {
    const { policies: customerPolicies, firstName } = customer;
    const body = {
      policies: customerPolicies.map(({ policyNumber, prodTypeCode }) => ({
        policyNumber,
        prodTypeCode,
        sourceSystem: 'PAS',
      })),
    };
    return this.httpService
      .postNamedResource<PolicyResponse[]>(AppEndpointsEnum.policies, body)
      .pipe(
        map((res) => {
          const policies = res.body;
          const getPolicyDetails = (p) => policies.find((s) => s.policyNumber === p.policyNumber);
          return {
            policies: customerPolicies
              .map((searchPolicy) => {
                if (
                  searchPolicy.policyStatus.toUpperCase() === 'ACTIVE' ||
                  searchPolicy.policyStatus.toUpperCase() === 'CANCELLED'
                ) {
                  const policyDetails = getPolicyDetails(searchPolicy);
                  if (!policyDetails) {
                    console.error(`Lookup for policy ${searchPolicy.policyNumber} failed.`);
                    return undefined;
                  }
                  return this.processPolicyResponse(policyDetails);
                }

                return undefined;
              })
              .filter((p) => !!p && p.gracePeriod),
            firstName,
          };
        }),
        tap(({ policies }) =>
          this.store.dispatch([
            new MetadataAction.SetProperties({
              policies: policies.map(({ number: policyNumber, type, riskState }) => ({
                number: policyNumber,
                type,
                riskState,
              })),
            }),
            new ContactInfoAction.LoadContacts(policies),
          ])
        ),
        map(({ policies }) => policies)
      );
  }

  buildSubtitleForPolicy(policy: Policy): string {
    switch (policy.type) {
      case PolicyType.PUP:
        return 'Personal Umbrella Policy';
      case PolicyType.Auto:
        return policy.vehicles.map((v) => v.name).join(', ');
      case PolicyType.Home:
        return policy.address;
    }
  }

  private mapCoverage(coverageResponse): Coverage {
    const coverage = {
      code: coverageResponse.code,
      general: coverageResponse.general,
      covered: coverageResponse.covered,
      label: coverageResponse.label,
      shortName: coverageResponse.shortName,
      twitterPitch: coverageResponse.twitterPitch,
      shortDesc: coverageResponse.shortDesc,
      coverages: [],
      extensions: coverageResponse.extensions || [],
      individualLimit: coverageResponse.limit && coverageResponse.limit.individualLimitAmount,
      occurrenceLimit: coverageResponse.limit && coverageResponse.limit.occurrenceLimitAmount,
      individualLimitDelimiter:
        coverageResponse.limit && coverageResponse.limit.individualLimitDelimiter,
      occurrenceLimitDelimiter:
        coverageResponse.limit && coverageResponse.limit.occurrenceLimitDelimiter,
      combinedSingleLimitAmount:
        coverageResponse.limit && coverageResponse.limit.combinedSingleLimitAmount,
      deductible: coverageResponse.deductible && coverageResponse.deductible.amount,
    };

    if (coverageResponse.coverages && coverageResponse.coverages.length > 0) {
      coverage.coverages = coverageResponse.coverages.map(this.mapCoverage, this);
    }

    return coverage;
  }

  private reformatCoverages(coverages): Coverage[] {
    return coverages.map(this.mapCoverage, this);
  }

  private reformatRiskFactors(riskFactors): any {
    return {
      waivedLiability: riskFactors && riskFactors.waivedLiabilityInd === 'true' ? true : false,
      antiLockBrakes: riskFactors && riskFactors.antiLockBrakesInd === 'true' ? true : false,
      antiTheft: riskFactors && riskFactors.antiTheftInd === 'true' ? true : false,
    };
  }

  private reformatAddress(dwelling: DwellingResponse) {
    const { address } = dwelling;

    return address && address.streetAddressLine
      ? PolicyHelper.titleCase(address.streetAddressLine)
      : '';
  }

  private reformatInsureds(insureds: InsuredResponse[]) {
    return insureds.map<Insured>((i) => ({
      id: i.sourceId,
      isActive: true,
      firstName: i.firstName,
      lastName: i.lastName,
      primary: i.primary,
    }));
  }

  processPolicyResponse(response: PolicyResponse): Policy {
    const policyType = PolicyHelper.typeToEnum(response.policyType);
    const vehicles =
      response.vehicles &&
      response.vehicles.map(
        ({ vehicleIdentifier, make, model, year, riskFactors, vin, ...vehicleData }) => ({
          id: vehicleIdentifier,
          vin,
          name: PolicyHelper.titleCase(`${year} ${make} ${model}`),
          make,
          model,
          year,
          coverages:
            vehicleData.coverages &&
            this.reformatCoverages(vehicleData.coverages.coverage).filter((v) => !v.general),
          riskFactors: this.reformatRiskFactors(riskFactors),
        })
      );

    const drivers =
      (response.drivers &&
        response.drivers.map(
          ({ fullName, dob, licenseNumber, coverages: driverCoverages, type }) => {
            // TODO: there can be a case when there are more coverages than Automobile Death Benefits (not UAT/MVP)
            const coveragesDriver =
              driverCoverages && driverCoverages.coverage && driverCoverages.coverage.length
                ? this.reformatCoverages(driverCoverages.coverage)
                : [];

            return {
              id: licenseNumber,
              fullName,
              dob: DateHelper.toDate(dob),
              coverageType:
                type === 'Rated Driver'
                  ? DriverCoverageType.Rated
                  : type === 'Excluded Driver'
                  ? DriverCoverageType.Excluded
                  : DriverCoverageType.NotRated,
              coverages: coveragesDriver,
            };
          }
        )) ||
      [];

    const agent: Agent = response.agent && {
      name: response.agent.fullName,
      phone: response.agent.telephoneNumber,
      email: response.agent.emailAddress,
      isService: !!/\b(house)\b/gi.test(response.agent.fullName),
    };

    let coverages = [];
    if (policyType === PolicyType.Auto) {
      coverages =
        response.coverages &&
        this.reformatCoverages(response.coverages.coverage).filter((c) => c.general);
    } else {
      coverages = response.coverages && this.reformatCoverages(response.coverages.coverage);
    }

    const generalData = {
      type: PolicyHelper.typeToEnum(response.policyType),
      id: response.policyNumber,
      number: response.policyNumber,
      status: PolicyHelper.statusToEnum(response.policyStatus),
      address: response.dwelling && this.reformatAddress(response.dwelling),
      productClass: response.productClass,
      productCode: response.productCode,
      policyPrefix: response.policyPrefix,
      deductible:
        response.coverages && response.coverages.deductible && response.coverages.deductible.amount,
      riskState: response.riskState,
      gracePeriod: true,
      termEffectiveDate: response.termEffectiveDate,
      termExpirationDate: response.termExpirationDate,
      eValueEnrollment: PolicyService.parseEValueEnrollment(response),
    };

    if (generalData.status === PolicyStatus.CANCELLED) {
      const statusDate = DateHelper.toDate(response.statusDate);
      generalData.gracePeriod =
        Math.abs(differenceInDays(Date.now(), statusDate)) <= POLICY_LIMIT_CANCELED_DAYS;
    }

    const insureds = response.insureds ? this.reformatInsureds(response.insureds) : [];

    const policy: Policy = {
      vehicles,
      drivers,
      agent,
      coverages,
      subtitle: '',
      insureds,
      ...generalData,
    };

    policy.subtitle = this.buildSubtitleForPolicy(policy);
    return policy;
  }

  getDocumentsForPolicy(policyNumber: string, docType: PolicyType): Observable<PolicyDocument[]> {
    return this.httpService
      .getNamedResource<PolicyDocument[]>(AppEndpointsEnum.policyDocuments, {
        routeParams: { policyNumber, docType: PolicyHelper.typeCodeFromEnum(docType) },
      })
      .pipe(
        map((res) => {
          const documents: PolicyDocument[] = (res.body || []).map((d) =>
            PolicyService.mapPolicyDocument(d, policyNumber)
          );
          const fnSortByProcessDateDesc = (a: PolicyDocument, b: PolicyDocument) => {
            if (a.processDate !== b.processDate) {
              const firstDate = Date.parse(a.processDate);
              const secondDate = Date.parse(b.processDate);
              return secondDate - firstDate; // most recent (bigger) date first
            }
            return a.docName.localeCompare(b.docName);
          };
          return documents.sort((a, b) => {
            if (PolicyDocumentType[a.docType] === PolicyDocumentType.IDCard) {
              if (PolicyDocumentType[b.docType] === PolicyDocumentType.IDCard) {
                return fnSortByProcessDateDesc(a, b);
              } else {
                return -1;
              }
            } else {
              if (PolicyDocumentType[b.docType] === PolicyDocumentType.IDCard) {
                return 1;
              } else {
                return fnSortByProcessDateDesc(a, b);
              }
            }
          });
        })
      );
  }

  getDocumentByOid(
    policyNumber: string,
    docType: PolicyType,
    oid: string
  ): Observable<PolicyDocument> {
    return this.httpService
      .getNamedResource<PolicyDocument[]>(AppEndpointsEnum.policyDocuments, {
        routeParams: { policyNumber, docType: PolicyHelper.typeCodeFromEnum(docType) },
        params: { oid },
      })
      .pipe(map((res) => PolicyService.mapPolicyDocument(res?.body[0], policyNumber)));
  }

  getAllowedEndorsements(
    policyNumber: string,
    policyType: string,
    riskState: string
  ): Observable<string[]> {
    return this.httpService
      .getNamedResource<{ allowedEndorsements: string[] }>(AppEndpointsEnum.policyEndorsements, {
        params: { policyType, riskState, policyNumber },
      })
      .pipe(map((res) => res?.body?.allowedEndorsements));
  }

  /**
   * Query documents by doc type and pick the first one as the list is ordered by process date, most recent first.
   */
  getPolicyDocument(
    policyNumber: string,
    productType: ProductType,
    docType: DocumentType
  ): Observable<PolicyDocument> {
    return this.httpService
      .getNamedResource<any>(AppEndpointsEnum.policyDocumentByType, {
        routeParams: {
          policyNumber,
          docType,
          productType: this.getProductTypeString(productType),
        },
      })
      .pipe(map((res) => PolicyService.mapPolicyDocument(res?.body[0], policyNumber)));
  }

  getWalletPassForPolicy(policyNumber: string): Observable<string> {
    return this.httpService
      .getNamedResource<{ url: string }>(AppEndpointsEnum.proofOfInsuranceWalletPass, {
        routeParams: { policyNumber },
      })
      .pipe(map((res) => res.body.url));
  }

  public acceptPaperlessEnrollmentTerms(customer: CustomerSearchResponse): Observable<void> {
    const policyNumbers = customer.policies.map(({ policyNumber }) => ({ policyNumber }));
    return this.httpService
      .postNamedResource<void>(AppEndpointsEnum.paperlessEnrollmentAccepted, policyNumbers)
      .pipe(map(({ body }) => body));
  }

  private getProductTypeString(productType: ProductType): string {
    switch (productType) {
      case ProductType.Pup:
        return 'PUP';
      case ProductType.Auto:
        return 'AU';
      case ProductType.Home:
        return 'HO';
      default:
        return 'AU';
    }
  }
}
