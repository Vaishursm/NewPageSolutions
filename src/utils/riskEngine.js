// Pure risk classification engine for SENTINEL onboarding.
// Returns { risk: 'HIGH'|'MEDIUM'|'LOW'|'PENDING', reasons: string[] }

const HIGH_RISK_COUNTRIES = ["Russia", "Belarus", "Venezuela"];
const MEDIUM_RISK_COUNTRIES = [
  "Brazil",
  "Turkey",
  "South Africa",
  "Mexico",
  "UAE",
  "China",
];
const HIGH_RISK_FUND_SOURCES = ["Inheritance", "Gift", "Other"];

// Fields required to compute risk classification.
export const CRITICAL_FIELDS = [
  "client_type",
  "country_of_tax_residence",
  "annual_income",
  "source_of_funds",
  "pep_status",
  "sanctions_screening_match",
  "adverse_media_flag",
];

export function hasCriticalFields(record) {
  return CRITICAL_FIELDS.every((f) => {
    const v = record[f];
    return v !== undefined && v !== null && v !== "";
  });
}

export function classifyRisk(record) {
  const reasons = [];

  if (!hasCriticalFields(record)) {
    return { risk: "PENDING", reasons: ["Missing critical fields for risk computation"] };
  }

  // HIGH
  if (record.pep_status === true) reasons.push("PEP flagged");
  if (record.sanctions_screening_match === true) reasons.push("Sanctions screening match");
  if (record.adverse_media_flag === true) reasons.push("Adverse media flag");
  if (HIGH_RISK_COUNTRIES.includes(record.country_of_tax_residence))
    reasons.push(`High-risk country: ${record.country_of_tax_residence}`);

  if (reasons.length > 0) return { risk: "HIGH", reasons };

  // MEDIUM
  if (record.client_type === "ENTITY") reasons.push("Client type is ENTITY");
  if (MEDIUM_RISK_COUNTRIES.includes(record.country_of_tax_residence))
    reasons.push(`Medium-risk country: ${record.country_of_tax_residence}`);

  const income = Number(record.annual_income);
  if (
    !Number.isNaN(income) &&
    income > 500000 &&
    HIGH_RISK_FUND_SOURCES.includes(record.source_of_funds)
  ) {
    reasons.push(`High income (${income}) from ${record.source_of_funds}`);
  }

  if (reasons.length > 0) return { risk: "MEDIUM", reasons };

  return { risk: "LOW", reasons: ["No risk indicators detected"] };
}
