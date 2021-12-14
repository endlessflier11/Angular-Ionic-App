import { ClaimsResponse } from 'src/app/micro-apps/csaa-mobile/_core/interfaces/claim.interface';
import { deepCopy } from '../misc';

export const CLAIMS_RESPONSE_MOCK: ClaimsResponse[] = [
  {
    claims: [
      {
        claimNumber: '1003-75-6924',
        dateOfLoss: '2020-09-07',
        claimsStatus: 'Open',
        type: 'AUTO',
        cause: 'Collision at an Intersection',
        openDate: '2020-09-08',
        closeDate: null,
        reportedDate: '2020-09-08',
        totalPaid: '0',
        policyNumber: 'WYSS910014010',
        description: 'Red light accident, brake hasn\u0027t working properly.',
        insuredParty: {
          name: 'Amanda Grant',
          drivingLicenseNumber: '107132123',
          drivingLicenseState: 'WY',
          age: '40',
          relationToNamedInsured: 'I',
          dateOfBirth: '1980-04-08',
        },
        insuredObject: {
          model: 'CHALLENGER',
          make: 'DODGE',
          manufacturedYear: '2020',
          serialNumber: null,
          odometerReader: '0',
          bodyType: '',
        },
        adjuster: {
          name: 'Kelsey Peavler',
          telephoneNumber: '018-432-2814',
          emailAddress: 'Ylurkk.Lbwwogn@saek.bbg',
        },
        workflow: [
          {
            eventType: 'Opened',
            date: 'Sep 08, 2020',
            title: 'Your Claim was Opened',
            description: 'Cause: Collision at an Intersection',
          },
          {
            eventType: 'Payment',
            date: '',
            title: 'Your Claim was Paid',
            description: 'Amount Paid to Date: 0',
          },
        ],
      },
    ],
    status: 'ok',
    message: '',
  },
  {
    claims: [
      {
        claimNumber: '1003-75-6935',
        dateOfLoss: '2020-09-01',
        claimsStatus: 'Open',
        type: 'Home',
        cause: 'Storm/wind',
        openDate: '2020-09-08',
        closeDate: null,
        reportedDate: '2020-09-08',
        totalPaid: '0',
        policyNumber: 'WYH6910014012',
        description: 'Tornado took the roof',
        insuredParty: null,
        insuredObject: null,
        adjuster: {
          name: 'Brandon Noland',
          telephoneNumber: '224-835-0510',
          emailAddress: 'Rboqimx.Ariyfs@hrdk.dia',
        },
        workflow: [
          {
            eventType: 'Opened',
            date: 'Sep 08, 2020',
            title: 'Your Claim was Opened',
            description: 'Cause: Storm/wind',
          },
          {
            eventType: 'Payment',
            date: '',
            title: 'Your Claim was Paid',
            description: 'Amount Paid to Date: 0',
          },
        ],
      },
    ],
    status: 'ok',
    message: '',
  },
  {
    claims: [],
    status: 'ok',
    message: '',
  },
];

export class ClaimsResponseMock {
  private readonly model: { [key: string]: any };
  public static create(fixture = CLAIMS_RESPONSE_MOCK) {
    return new ClaimsResponseMock(fixture);
  }

  constructor(fixture = CLAIMS_RESPONSE_MOCK) {
    this.model = deepCopy(fixture);
  }

  public toJson() {
    return deepCopy(this.model);
  }
}
