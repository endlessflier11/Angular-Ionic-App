import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Claim, ClaimResponse, ClaimsResponse } from '../interfaces/claim.interface';
import { Policy } from '../interfaces/policy.interface';
import { HttpService } from './http/http.service';
import { PolicyHelper } from '../shared/policy.helper';
import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { AppEndpointsEnum, Vehicle } from '../interfaces';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class ClaimService {
  constructor(private httpService: HttpService) {}

  fetchClaims(policies: Policy[]): Observable<Claim[]> {
    if (policies.length === 0) {return of([]);}

    const policyNumbers = policies.map((policy) => policy.number);
    return this.httpService
      .postNamedResource<ClaimsResponse[]>(AppEndpointsEnum.claims, {
        policyNumbers,
      })
      .pipe(
        map((responses) => responses.body.map((response) =>
            response.claims.map((claim) =>
              this.mapClaimData(
                claim,
                policies.find((p) => p.number === claim.policyNumber)
              )
            )
          )),
        map((responses) => [].concat(...responses))
      );
  }

  private mapClaimData(claimsResponse: ClaimResponse, policy: Policy): Claim {
    const {
      workflow,
      claimNumber,
      claimsStatus,
      cause,
      insuredObject,
      policyNumber,
      adjuster,
      totalPaid,
    } = claimsResponse;
    const isPaidOut = parseFloat(totalPaid || '0') > 0;

    // Most recent date first and then descending
    const orderedWorkflow = workflow
      ? workflow
          .filter((w) => w.eventType !== 'Payment' || isPaidOut)
          .sort((w) => Date.parse(w.date))
          .map((w) => ({ ...w, description: w.description === 'Cause: ' ? '' : w.description }))
          .reverse()
      : undefined;

    return {
      number: claimNumber,
      status: claimsStatus === 'Open' ? 'Open' : 'Closed',
      cause: !cause || cause === 'Other' ? '' : cause,
      type: policy.type,
      address: policy.address,
      policyNumber,
      vehicle:
        insuredObject &&
        ({
          id: insuredObject.serialNumber,
          name: PolicyHelper.titleCase(`${insuredObject.make} ${insuredObject.model}`),
        } as Vehicle),
      adjuster: {
        name: adjuster.name,
        phone: adjuster.telephoneNumber,
      },
      workflow: orderedWorkflow,
    };
  }
}
