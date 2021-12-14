/* eslint-disable max-len */
export const VEHICLE_COVERAGES_FIXTURE = [
  {
    code: 'COMP',
    general: false,
    covered: true,
    label: 'Comprehensive (less deductible) Safety Glass ($0 Deductible)',
    shortName: 'Comprehensive',
    twitterPitch: 'Covers your car',
    shortDesc:
      'Covers repairs if your car is damaged by a non-collision incident. Option available to cover damage to safety glass without a deductible for eligible vehicles. Covers damage to safety glass without a deductible',
    coverages: [],
    extensions: [{ attrName: 'glassInd', attrValue: true }],
    individualLimit: 0,
    occurrenceLimit: 750,
    individualLimitDelimiter: '',
    occurrenceLimitDelimiter: 'Deductible',
    combinedSingleLimitAmount: 0,
    deductible: null,
  },
  {
    code: 'COLL',
    general: false,
    covered: true,
    label: 'Collision (less deductible)',
    shortName: 'Collision',
    twitterPitch: 'Covers your car',
    shortDesc:
      'Covers repair or replacement of your car if you hit or are hit by another car or object',
    coverages: [],
    extensions: [],
    individualLimit: 0,
    occurrenceLimit: 0,
    individualLimitDelimiter: '',
    occurrenceLimitDelimiter: '',
    combinedSingleLimitAmount: 0,
    deductible: { isPresent: true, value: 750 },
  },
  {
    code: 'SEQ',
    general: false,
    covered: true,
    label: 'Special Equipment',
    shortName: 'Special Equipment',
    twitterPitch: 'Covers special accessories',
    shortDesc: 'Covers damage to custom bodywork and special accessories',
    coverages: [],
    extensions: [],
    individualLimit: 0,
    occurrenceLimit: 1500,
    individualLimitDelimiter: '',
    occurrenceLimitDelimiter: 'Per Disablement',
    combinedSingleLimitAmount: 0,
    deductible: null,
  },
  {
    code: 'RNT',
    general: false,
    covered: true,
    label: 'Rental Car Reimbursement',
    shortName: 'Rental Reimbursement',
    twitterPitch: 'Covers rental costs',
    shortDesc: 'Covers a set daily amount for a rental car',
    coverages: [],
    extensions: [],
    individualLimit: 40,
    occurrenceLimit: 1200,
    individualLimitDelimiter: 'Per Day',
    occurrenceLimitDelimiter: 'Maximum',
    combinedSingleLimitAmount: 0,
    deductible: null,
  },
  {
    code: 'TOW',
    general: false,
    covered: true,
    label: 'Towing & Labor',
    shortName: 'Towing & Labor',
    twitterPitch: 'Covers your car',
    shortDesc:
      'Covers towing and labor charges, such as changing a flat tire or jump-starting your battery',
    coverages: [],
    extensions: [],
    individualLimit: 50,
    occurrenceLimit: 300,
    individualLimitDelimiter: 'Per Disablement',
    occurrenceLimitDelimiter: 'Maximum',
    combinedSingleLimitAmount: 0,
    deductible: null,
  },
];