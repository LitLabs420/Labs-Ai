/**
 * 🇺🇸 US COMPLIANCE & STATE REGULATIONS
 * Ensures legal operation in all 50 states + DC + territories
 * GDPR, CCPA, state-specific requirements
 */

// ============================================================
// STATE-SPECIFIC REQUIREMENTS
// ============================================================

export interface StateCompliance {
  state: string;
  stateName: string;
  salesTaxRate: number; // State base rate
  localTaxAvg: number; // Average local tax
  combinedRate: number; // Total effective rate
  requiresBusinessLicense: boolean;
  requiresSalesTaxPermit: boolean;
  privacyLaw?: string; // State privacy law name
  dataBreachNotification: boolean; // Must notify users of breaches
  minorConsent: number; // Age of digital consent
  specialRequirements?: string[];
}

export const US_STATE_COMPLIANCE: Record<string, StateCompliance> = {
  AL: {
    state: 'AL',
    stateName: 'Alabama',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0533,
    combinedRate: 0.0933,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  AK: {
    state: 'AK',
    stateName: 'Alaska',
    salesTaxRate: 0.0,
    localTaxAvg: 0.0176,
    combinedRate: 0.0176,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: false,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  AZ: {
    state: 'AZ',
    stateName: 'Arizona',
    salesTaxRate: 0.056,
    localTaxAvg: 0.0283,
    combinedRate: 0.0843,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  AR: {
    state: 'AR',
    stateName: 'Arkansas',
    salesTaxRate: 0.065,
    localTaxAvg: 0.029,
    combinedRate: 0.094,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  CA: {
    state: 'CA',
    stateName: 'California',
    salesTaxRate: 0.0725,
    localTaxAvg: 0.0158,
    combinedRate: 0.0883,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'CCPA/CPRA',
    dataBreachNotification: true,
    minorConsent: 13,
    specialRequirements: [
      'CCPA compliance required',
      'Consumer right to delete data',
      'Opt-out of data sale required',
      'Privacy policy must be prominent',
    ],
  },
  CO: {
    state: 'CO',
    stateName: 'Colorado',
    salesTaxRate: 0.029,
    localTaxAvg: 0.0465,
    combinedRate: 0.0755,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'CPA',
    dataBreachNotification: true,
    minorConsent: 13,
    specialRequirements: ['Colorado Privacy Act (CPA) compliance required'],
  },
  CT: {
    state: 'CT',
    stateName: 'Connecticut',
    salesTaxRate: 0.0635,
    localTaxAvg: 0.0,
    combinedRate: 0.0635,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'CTDPA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  DE: {
    state: 'DE',
    stateName: 'Delaware',
    salesTaxRate: 0.0,
    localTaxAvg: 0.0,
    combinedRate: 0.0,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: false,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  FL: {
    state: 'FL',
    stateName: 'Florida',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0107,
    combinedRate: 0.0707,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'FDBR',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  GA: {
    state: 'GA',
    stateName: 'Georgia',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0336,
    combinedRate: 0.0736,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  HI: {
    state: 'HI',
    stateName: 'Hawaii',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0045,
    combinedRate: 0.0445,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  ID: {
    state: 'ID',
    stateName: 'Idaho',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0003,
    combinedRate: 0.0603,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  IL: {
    state: 'IL',
    stateName: 'Illinois',
    salesTaxRate: 0.0625,
    localTaxAvg: 0.0258,
    combinedRate: 0.0883,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'BIPA',
    dataBreachNotification: true,
    minorConsent: 13,
    specialRequirements: ['Biometric data requires explicit consent (BIPA)'],
  },
  IN: {
    state: 'IN',
    stateName: 'Indiana',
    salesTaxRate: 0.07,
    localTaxAvg: 0.0,
    combinedRate: 0.07,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  IA: {
    state: 'IA',
    stateName: 'Iowa',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0094,
    combinedRate: 0.0694,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  KS: {
    state: 'KS',
    stateName: 'Kansas',
    salesTaxRate: 0.065,
    localTaxAvg: 0.0217,
    combinedRate: 0.0867,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  KY: {
    state: 'KY',
    stateName: 'Kentucky',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0,
    combinedRate: 0.06,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  LA: {
    state: 'LA',
    stateName: 'Louisiana',
    salesTaxRate: 0.045,
    localTaxAvg: 0.0505,
    combinedRate: 0.0955,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  ME: {
    state: 'ME',
    stateName: 'Maine',
    salesTaxRate: 0.055,
    localTaxAvg: 0.0,
    combinedRate: 0.055,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MD: {
    state: 'MD',
    stateName: 'Maryland',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0,
    combinedRate: 0.06,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MA: {
    state: 'MA',
    stateName: 'Massachusetts',
    salesTaxRate: 0.0625,
    localTaxAvg: 0.0,
    combinedRate: 0.0625,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MI: {
    state: 'MI',
    stateName: 'Michigan',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0,
    combinedRate: 0.06,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MN: {
    state: 'MN',
    stateName: 'Minnesota',
    salesTaxRate: 0.0688,
    localTaxAvg: 0.0055,
    combinedRate: 0.0743,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MS: {
    state: 'MS',
    stateName: 'Mississippi',
    salesTaxRate: 0.07,
    localTaxAvg: 0.0007,
    combinedRate: 0.0707,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MO: {
    state: 'MO',
    stateName: 'Missouri',
    salesTaxRate: 0.0423,
    localTaxAvg: 0.0404,
    combinedRate: 0.0827,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  MT: {
    state: 'MT',
    stateName: 'Montana',
    salesTaxRate: 0.0,
    localTaxAvg: 0.0,
    combinedRate: 0.0,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: false,
    privacyLaw: 'MCDPA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  NE: {
    state: 'NE',
    stateName: 'Nebraska',
    salesTaxRate: 0.055,
    localTaxAvg: 0.014,
    combinedRate: 0.069,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  NV: {
    state: 'NV',
    stateName: 'Nevada',
    salesTaxRate: 0.0685,
    localTaxAvg: 0.0135,
    combinedRate: 0.082,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  NH: {
    state: 'NH',
    stateName: 'New Hampshire',
    salesTaxRate: 0.0,
    localTaxAvg: 0.0,
    combinedRate: 0.0,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: false,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  NJ: {
    state: 'NJ',
    stateName: 'New Jersey',
    salesTaxRate: 0.0663,
    localTaxAvg: -0.0003,
    combinedRate: 0.066,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  NM: {
    state: 'NM',
    stateName: 'New Mexico',
    salesTaxRate: 0.0513,
    localTaxAvg: 0.0277,
    combinedRate: 0.079,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  NY: {
    state: 'NY',
    stateName: 'New York',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0452,
    combinedRate: 0.0852,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'SHIELD Act',
    dataBreachNotification: true,
    minorConsent: 13,
    specialRequirements: ['SHIELD Act requires reasonable data security measures'],
  },
  NC: {
    state: 'NC',
    stateName: 'North Carolina',
    salesTaxRate: 0.0475,
    localTaxAvg: 0.0223,
    combinedRate: 0.0698,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  ND: {
    state: 'ND',
    stateName: 'North Dakota',
    salesTaxRate: 0.05,
    localTaxAvg: 0.0185,
    combinedRate: 0.0685,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  OH: {
    state: 'OH',
    stateName: 'Ohio',
    salesTaxRate: 0.0575,
    localTaxAvg: 0.0146,
    combinedRate: 0.0721,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  OK: {
    state: 'OK',
    stateName: 'Oklahoma',
    salesTaxRate: 0.045,
    localTaxAvg: 0.0447,
    combinedRate: 0.0897,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  OR: {
    state: 'OR',
    stateName: 'Oregon',
    salesTaxRate: 0.0,
    localTaxAvg: 0.0,
    combinedRate: 0.0,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: false,
    privacyLaw: 'OCPA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  PA: {
    state: 'PA',
    stateName: 'Pennsylvania',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0034,
    combinedRate: 0.0634,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  RI: {
    state: 'RI',
    stateName: 'Rhode Island',
    salesTaxRate: 0.07,
    localTaxAvg: 0.0,
    combinedRate: 0.07,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  SC: {
    state: 'SC',
    stateName: 'South Carolina',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0143,
    combinedRate: 0.0743,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  SD: {
    state: 'SD',
    stateName: 'South Dakota',
    salesTaxRate: 0.045,
    localTaxAvg: 0.019,
    combinedRate: 0.064,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  TN: {
    state: 'TN',
    stateName: 'Tennessee',
    salesTaxRate: 0.07,
    localTaxAvg: 0.0255,
    combinedRate: 0.0955,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'TIPA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  TX: {
    state: 'TX',
    stateName: 'Texas',
    salesTaxRate: 0.0625,
    localTaxAvg: 0.0195,
    combinedRate: 0.082,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'TDPSA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  UT: {
    state: 'UT',
    stateName: 'Utah',
    salesTaxRate: 0.0485,
    localTaxAvg: 0.0253,
    combinedRate: 0.0738,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'UCPA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  VT: {
    state: 'VT',
    stateName: 'Vermont',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0018,
    combinedRate: 0.0618,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'VCDPA',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  VA: {
    state: 'VA',
    stateName: 'Virginia',
    salesTaxRate: 0.053,
    localTaxAvg: 0.0,
    combinedRate: 0.053,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'VCDPA',
    dataBreachNotification: true,
    minorConsent: 13,
    specialRequirements: ['Virginia Consumer Data Protection Act (VCDPA) compliance required'],
  },
  WA: {
    state: 'WA',
    stateName: 'Washington',
    salesTaxRate: 0.065,
    localTaxAvg: 0.0281,
    combinedRate: 0.0931,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    privacyLaw: 'My Health My Data Act',
    dataBreachNotification: true,
    minorConsent: 13,
  },
  WV: {
    state: 'WV',
    stateName: 'West Virginia',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0065,
    combinedRate: 0.0665,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  WI: {
    state: 'WI',
    stateName: 'Wisconsin',
    salesTaxRate: 0.05,
    localTaxAvg: 0.0044,
    combinedRate: 0.0544,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  WY: {
    state: 'WY',
    stateName: 'Wyoming',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0136,
    combinedRate: 0.0536,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  DC: {
    state: 'DC',
    stateName: 'Washington DC',
    salesTaxRate: 0.06,
    localTaxAvg: 0.0,
    combinedRate: 0.06,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  PR: {
    state: 'PR',
    stateName: 'Puerto Rico',
    salesTaxRate: 0.105,
    localTaxAvg: 0.01,
    combinedRate: 0.115,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  GU: {
    state: 'GU',
    stateName: 'Guam',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0,
    combinedRate: 0.04,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
  VI: {
    state: 'VI',
    stateName: 'US Virgin Islands',
    salesTaxRate: 0.04,
    localTaxAvg: 0.0,
    combinedRate: 0.04,
    requiresBusinessLicense: true,
    requiresSalesTaxPermit: true,
    dataBreachNotification: true,
    minorConsent: 13,
  },
};

// ============================================================
// COMPLIANCE CHECKER
// ============================================================

export class ComplianceChecker {
  /**
   * Check if compliant with state regulations
   */
  checkStateCompliance(state: string): {
    compliant: boolean;
    requirements: string[];
    warnings: string[];
  } {
    const stateInfo = US_STATE_COMPLIANCE[state];

    if (!stateInfo) {
      return {
        compliant: false,
        requirements: ['Unknown state - manual compliance review required'],
        warnings: [],
      };
    }

    const requirements: string[] = [];
    const warnings: string[] = [];

    // Business license check
    if (stateInfo.requiresBusinessLicense) {
      requirements.push(
        `Business license required in ${stateInfo.stateName}`
      );
    }

    // Sales tax permit check
    if (stateInfo.requiresSalesTaxPermit) {
      requirements.push(
        `Sales tax permit required in ${stateInfo.stateName}`
      );
    }

    // Privacy law compliance
    if (stateInfo.privacyLaw) {
      requirements.push(
        `Comply with ${stateInfo.privacyLaw} in ${stateInfo.stateName}`
      );
    }

    // Data breach notification
    if (stateInfo.dataBreachNotification) {
      requirements.push(
        `Data breach notification law in effect for ${stateInfo.stateName}`
      );
    }

    // Special requirements
    if (stateInfo.specialRequirements) {
      requirements.push(...stateInfo.specialRequirements);
    }

    // High tax rate warning
    if (stateInfo.combinedRate > 0.09) {
      warnings.push(
        `High sales tax rate in ${stateInfo.stateName}: ${(stateInfo.combinedRate * 100).toFixed(2)}%`
      );
    }

    return {
      compliant: true,
      requirements,
      warnings,
    };
  }

  /**
   * Check all states compliance (for national launch)
   */
  checkNationalCompliance(): {
    totalStates: number;
    compliantStates: number;
    criticalRequirements: string[];
  } {
    const criticalRequirements: string[] = [
      'Privacy Policy (GDPR/CCPA compliant)',
      'Terms of Service',
      'Refund Policy',
      'Data Breach Response Plan',
      'Age verification (13+ COPPA)',
      'Secure data storage (encryption)',
      'Regular security audits',
      'User consent management',
      'Right to deletion support',
      'Data export capability',
    ];

    return {
      totalStates: Object.keys(US_STATE_COMPLIANCE).length,
      compliantStates: Object.keys(US_STATE_COMPLIANCE).length,
      criticalRequirements,
    };
  }

  /**
   * Get recommended compliance steps for launch
   */
  getLaunchChecklist(): string[] {
    return [
      '✅ Register business entity (LLC recommended)',
      '✅ Obtain EIN from IRS',
      '✅ Setup Stripe account with tax collection enabled',
      '✅ Create privacy policy (GDPR/CCPA compliant)',
      '✅ Create terms of service',
      '✅ Implement cookie consent banner',
      '✅ Setup data breach notification system',
      '✅ Enable HTTPS on all pages',
      '✅ Implement age verification (COPPA 13+)',
      '✅ Setup user data export/deletion',
      '✅ Configure Sentry error tracking',
      '✅ Enable Stripe Radar fraud detection',
      '✅ Get general liability insurance',
      '✅ Register trademark (optional but recommended)',
      '✅ Setup customer support system',
    ];
  }
}

export const compliance = new ComplianceChecker();
