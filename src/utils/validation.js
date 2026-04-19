import { RISK_CONFIG, hasCriticalFields } from "./riskEngine";

export const REQUIRED_SUBMIT_FIELDS = ["client_id", "client_name", "onboarding_date"];

// Fields required for KYC approval - ALL must have valid values
export const REQUIRED_KYC_APPROVAL_FIELDS = [
  "client_id",
  "client_name",
  "branch",
  "onboarding_date",
  "client_type",
  "country_of_tax_residence",
  "annual_income",
  "source_of_funds",
  "pep_status",
  "sanctions_screening_match",
  "adverse_media_flag",
  "relationship_manager",
  "id_verification_date",
  "documentation_complete",
];

export function validateSubmission(record, existingRecords) {
  const errors = {};
  for (const f of REQUIRED_SUBMIT_FIELDS) {
    if (!record[f] || String(record[f]).trim() === "") {
      errors[f] = "Required";
    }
  }
  if (
    record.client_id &&
    existingRecords.some((r) => r.client_id === record.client_id)
  ) {
    errors.client_id = "client_id must be unique";
  }
  return errors;
}

/**
 * Check if a record has all fields required for KYC approval.
 * Returns { isValid: boolean, missingFields: string[] }
 */
export function validateKycApproval(record) {
  const missingFields = [];
  
  for (const field of REQUIRED_KYC_APPROVAL_FIELDS) {
    const value = record[field];
    const isEmpty = value === null || value === undefined || value === "";
    
    if (isEmpty) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Check if missing fields affect risk assessment.
 * Only fields in RISK_CONFIG.criticalFields affect risk classification.
 */
export function getMissingRiskFields(record) {
  const missingRiskFields = [];
  
  for (const field of RISK_CONFIG.criticalFields) {
    const value = record[field];
    const isEmpty = value === null || value === undefined || value === "";
    
    if (isEmpty) {
      missingRiskFields.push(field);
    }
  }
  
  return missingRiskFields;
}

export function validationStatus(record) {
  return hasCriticalFields(record) ? "VALID" : "PENDING";
}

export function display(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
