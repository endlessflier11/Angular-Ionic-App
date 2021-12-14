import {
  Policy,
  PolicyStatus,
  PolicyType,
} from '../../app/micro-apps/csaa-mobile/_core/interfaces/policy.interface';

export function generatePolicy(overrides): Policy {
  return Object.assign(
    {
      type: PolicyType.Auto,
      id: '1',
      subtitle: 'subtitle',
      number: '1',
      status: PolicyStatus.ACTIVE,
      agent: {
        name: 'testname',
        phone: 'testphone',
        email: 'testemail',
      },
      drivers: [],
      coverages: [{}],
      productClass: '',
      address: '',
    },
    overrides
  );
}
