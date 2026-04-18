import { hasCriticalFields } from "./riskEngine";

export const REQUIRED_SUBMIT_FIELDS = ["client_id", "client_name", "onboarding_date"];

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

export function validationStatus(record) {
  return hasCriticalFields(record) ? "VALID" : "PENDING";
}

export function display(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
