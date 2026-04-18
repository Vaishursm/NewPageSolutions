// Sample CSV headers and data
export const REQUIRED_HEADERS = [
  "client_id",
  "branch",
  "onboarding_date",
  "client_name",
  "client_type",
  "country_of_tax_residence",
  "annual_income",
  "source_of_funds",
  "pep_status",
  "sanctions_screening_match",
  "adverse_media_flag",
  "risk_classification",
  "kyc_status",
  "id_verification_date",
  "relationship_manager",
  "documentation_complete",
];

export const SAMPLE_CSV_DATA = [
  {
    client_id: "CLT-001",
    branch: "Mayfair",
    onboarding_date: "2024-11-04",
    client_name: "Sarah Williams",
    client_type: "INDIVIDUAL",
    country_of_tax_residence: "Netherlands",
    annual_income: "78000",
    source_of_funds: "Business Income",
    pep_status: "FALSE",
    sanctions_screening_match: "FALSE",
    adverse_media_flag: "FALSE",
    risk_classification: "LOW",
    kyc_status: "APPROVED",
    id_verification_date: "2024-10-14",
    relationship_manager: "R. Patel",
    documentation_complete: "TRUE",
  },
  {
    client_id: "CLT-002",
    branch: "Edinburgh",
    onboarding_date: "2024-04-08",
    client_name: "Emma Johansson",
    client_type: "INDIVIDUAL",
    country_of_tax_residence: "Netherlands",
    annual_income: "1200000",
    source_of_funds: "Gift",
    pep_status: "FALSE",
    sanctions_screening_match: "FALSE",
    adverse_media_flag: "FALSE",
    risk_classification: "MEDIUM",
    kyc_status: "APPROVED",
    id_verification_date: "2024-03-23",
    relationship_manager: "M. Ferrara",
    documentation_complete: "TRUE",
  },
  {
    client_id: "CLT-003",
    branch: "Manchester",
    onboarding_date: "2024-03-07",
    client_name: "Marcus Al-Rashid",
    client_type: "ENTITY",
    country_of_tax_residence: "Germany",
    annual_income: "1200000",
    source_of_funds: "Business Income",
    pep_status: "FALSE",
    sanctions_screening_match: "FALSE",
    adverse_media_flag: "FALSE",
    risk_classification: "MEDIUM",
    kyc_status: "PENDING",
    id_verification_date: "",
    relationship_manager: "R. Patel",
    documentation_complete: "FALSE",
  },
];

export function generateSampleCSV() {
  // Create CSV header
  const header = REQUIRED_HEADERS.join(",");
  
  // Create CSV rows
  const rows = SAMPLE_CSV_DATA.map((record) =>
    REQUIRED_HEADERS.map((field) => {
      const value = record[field] ?? "";
      // Quote fields that contain commas or quotes
      if (String(value).includes(",") || String(value).includes('"')) {
        return `"${String(value).replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",")
  );
  
  return [header, ...rows].join("\n");
}

export function validateCSVHeaders(csvHeaders) {
  const missing = REQUIRED_HEADERS.filter(
    (h) => !csvHeaders.includes(h)
  );
  return {
    isValid: missing.length === 0,
    missing,
  };
}
