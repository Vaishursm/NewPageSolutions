// Pure isk classification engine for SENTINEL onboarding.
// Returns { risk: 'HIGH'|'MEDIUM'|'LOW'|'PENDING', reasons: string[] }

/**
 * Risk classification configuration.
 * Rules are evaluated in order: HIGH rules first, then MEDIUM, then LOW (default).
 * Each rule can check a field value and produce a reason if matched.
 */
export const RISK_CONFIG = {
  // Fields required to compute risk classification
  criticalFields: [
    "client_type",
    "country_of_tax_residence",
    "annual_income",
    "source_of_funds",
    "pep_status",
    "sanctions_screening_match",
    "adverse_media_flag",
  ],

  // High-risk countries trigger HIGH classification
  highRiskCountries: ["Russia", "Belarus", "Venezuela"],

  // Medium-risk countries and entity types trigger MEDIUM classification
  mediumRiskCountries: ["Brazil", "Turkey", "South Africa", "Mexico", "UAE", "China"],

  // Fund sources that combined with high income trigger MEDIUM classification
  highRiskFundSources: ["Inheritance", "Gift", "Other"],

  // Income threshold for high-income + risky-fund-source rule
  highIncomeThreshold: 500000,

  // Rule definitions for each risk level
  rules: {
    HIGH: [
      {
        name: "PEP Status",
        check: (record) => record.pep_status === true,
        reason: "PEP flagged",
      },
      {
        name: "Sanctions Match",
        check: (record) => record.sanctions_screening_match === true,
        reason: "Sanctions screening match",
      },
      {
        name: "Adverse Media",
        check: (record) => record.adverse_media_flag === true,
        reason: "Adverse media flag",
      },
      {
        name: "High Risk Country",
        check: (record) => RISK_CONFIG.highRiskCountries.includes(record.country_of_tax_residence),
        reason: (record) => `High-risk country: ${record.country_of_tax_residence}`,
      },
    ],
    MEDIUM: [
      {
        name: "Entity Type",
        check: (record) => record.client_type === "ENTITY",
        reason: "Client type is ENTITY",
      },
      {
        name: "Medium Risk Country",
        check: (record) => RISK_CONFIG.mediumRiskCountries.includes(record.country_of_tax_residence),
        reason: (record) => `Medium-risk country: ${record.country_of_tax_residence}`,
      },
      {
        name: "High Income + Risky Funds",
        check: (record) => {
          const income = Number(record.annual_income);
          return (
            !Number.isNaN(income) &&
            income > RISK_CONFIG.highIncomeThreshold &&
            RISK_CONFIG.highRiskFundSources.includes(record.source_of_funds)
          );
        },
        reason: (record) => `High income (${record.annual_income}) from ${record.source_of_funds}`,
      },
    ],
  },
};

// Fields required to compute risk classification (exported for compatibility)
export const CRITICAL_FIELDS = RISK_CONFIG.criticalFields;

export function hasCriticalFields(record) {
  return CRITICAL_FIELDS.every((f) => {
    const v = record[f];
    return v !== undefined && v !== null && v !== "";
  });
}

export function classifyRisk(record) {
  const reasons = [];

  if (!hasCriticalFields(record)) {
    return { 
      risk: "PENDING", 
      reasons: ["Missing critical fields for risk computation"],
      requiresApproval: false 
    };
  }

  // Evaluate HIGH risk rules
  for (const rule of RISK_CONFIG.rules.HIGH) {
    if (rule.check(record)) {
      const reason = typeof rule.reason === "function" ? rule.reason(record) : rule.reason;
      reasons.push(reason);
    }
  }

  if (reasons.length > 0) {
    return { 
      risk: "HIGH", 
      reasons,
      requiresApproval: true 
    };
  }

  // Evaluate MEDIUM risk rules
  for (const rule of RISK_CONFIG.rules.MEDIUM) {
    if (rule.check(record)) {
      const reason = typeof rule.reason === "function" ? rule.reason(record) : rule.reason;
      reasons.push(reason);
    }
  }

  if (reasons.length > 0) {
    return { 
      risk: "MEDIUM", 
      reasons,
      requiresApproval: false 
    };
  }

  return { 
    risk: "LOW", 
    reasons: ["No risk indicators detected"],
    requiresApproval: false 
  };
}
