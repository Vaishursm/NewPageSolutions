import { useState } from "react";
import { classifyRisk } from "@/utils/riskEngine";
import { validateSubmission, validationStatus } from "@/utils/validation";
import { RiskBadge } from "@/components/RiskBadge";

const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Switzerland",
  "Netherlands", "Italy", "Spain", "Sweden", "Norway", "Denmark", "Ireland",
  "Singapore", "Japan", "Canada", "Australia",
  "Brazil", "Turkey", "South Africa", "Mexico", "UAE", "China",
  "Russia", "Belarus", "Venezuela",
];

const SOURCES = [
  "Salary", "Employment", "Business Income", "Investment", "Investment Returns",
  "Inheritance", "Gift", "Pension", "Property Sale", "Other",
];

const KYC = ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "ENHANCED_DUE_DILIGENCE"];

const empty = {
  client_id: "",
  branch: "",
  onboarding_date: new Date().toISOString().slice(0, 10),
  client_name: "",
  client_type: "INDIVIDUAL",
  country_of_tax_residence: "",
  annual_income: "",
  source_of_funds: "",
  pep_status: false,
  sanctions_screening_match: false,
  adverse_media_flag: false,
  kyc_status: "PENDING",
  id_verification_date: "",
  relationship_manager: "",
  documentation_complete: false,
};

const inputCls =
  "w-full min-h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function AddClientForm({ records, onAdd }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear error for this field when user starts editing
    if (errors[field]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const normalized = {
      ...form,
      annual_income: form.annual_income === "" ? null : Number(form.annual_income),
    };
    const errs = validateSubmission(normalized, records);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const { risk, reasons } = classifyRisk(normalized);
    const record = {
      ...normalized,
      created_at: new Date().toISOString(),
      input_snapshot: { ...normalized },
      computed_risk: risk,
      computed_reasons: reasons,
      validation_status: validationStatus(normalized),
      risk_classification: null,
    };
    onAdd(record);
    setPreview({ risk, reasons, client_id: normalized.client_id });
    setForm(empty);
    setErrors({});
  }

  function field(label, key, type = "text", opts = {}) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {opts.options ? (
          <select
            className={inputCls}
            value={form[key] ?? ""}
            onChange={(e) => update(key, e.target.value)}
          >
            <option value="">Select…</option>
            {opts.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : type === "checkbox" ? (
          <input
            type="checkbox"
            className="h-6 w-6 rounded border-input"
            checked={!!form[key]}
            onChange={(e) => update(key, e.target.checked)}
          />
        ) : (
          <input
            type={type}
            className={inputCls}
            value={form[key] ?? ""}
            onChange={(e) => update(key, e.target.value)}
          />
        )}
        {errors[key] && <span className="text-xs text-destructive">{errors[key]}</span>}
      </label>
    );
  }

  return (
    <div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="mb-2 text-sm font-semibold text-destructive">Validation Errors</h3>
          <ul className="space-y-1">
            {Object.entries(errors).map(([k, v]) => (
              <li key={k} className="text-sm text-destructive">
                <strong>{k}</strong>: {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">✅ Client Added Successfully</p>
              <p className="text-xs text-muted-foreground">
                <strong>{preview.client_id}</strong> classified as <strong>{preview.risk}</strong>
              </p>
              {preview.reasons.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>Reasons:</strong> {preview.reasons.join("; ")}
                </p>
              )}
            </div>
            <RiskBadge level={preview.risk} />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-3 pb-4 border-b border-border">
          <legend className="text-sm font-semibold text-foreground">Basic Information</legend>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {field("Client ID *", "client_id")}
            {field("Client Name *", "client_name")}
            {field("Branch", "branch")}
            {field("Onboarding Date *", "onboarding_date", "date")}
            {field("Client Type", "client_type", "text", { options: ["INDIVIDUAL", "ENTITY"] })}
            {field("Country", "country_of_tax_residence", "text", { options: COUNTRIES })}
          </div>
        </fieldset>

        <fieldset className="space-y-3 pb-4 border-b border-border pt-4">
          <legend className="text-sm font-semibold text-foreground">Financial Information</legend>
          <div className="grid gap-3 md:grid-cols-3">
            {field("Annual Income", "annual_income", "number")}
            {field("Source of Funds", "source_of_funds", "text", { options: SOURCES })}
          </div>
        </fieldset>

        <fieldset className="space-y-3 pb-4 border-b border-border pt-4">
          <legend className="text-sm font-semibold text-foreground">Compliance & Verification</legend>
          <div className="grid gap-3 md:grid-cols-4">
            {field("KYC Status", "kyc_status", "text", { options: KYC })}
            {field("ID Verification Date", "id_verification_date", "date")}
            {field("Relationship Manager", "relationship_manager")}
          </div>
        </fieldset>

        <fieldset className="space-y-3 pt-4">
          <legend className="text-sm font-semibold text-foreground">Risk Indicators</legend>
          <div className="grid gap-3 md:grid-cols-4 rounded-lg border border-border bg-muted/40 p-4">
            {field("PEP Status", "pep_status", "checkbox")}
            {field("Sanctions Match", "sanctions_screening_match", "checkbox")}
            {field("Adverse Media", "adverse_media_flag", "checkbox")}
            {field("Documentation Complete", "documentation_complete", "checkbox")}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            className="min-h-11 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Submit & Classify
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(empty);
              setErrors({});
              setPreview(null);
            }}
            className="min-h-11 rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
