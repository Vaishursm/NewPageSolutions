import { useEffect, useRef, useState } from "react";
import { classifyRisk } from "@/utils/riskEngine";
import { validateSubmission, validationStatus } from "@/utils/validation";
import { RiskBadge } from "@/components/RiskBadge";
import { ApprovalBadge } from "@/components/ApprovalBadge";
import { AuditTrail } from "@/components/AuditTrail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Pencil, ChevronUp } from "lucide-react";

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

const empty = () => ({
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
  lastUpdatedAt: new Date().toISOString(),
});

const cellInput =
  "w-full min-h-9 rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring";

function Select({ value, onChange, options, placeholder = "—", autoFocus, onBlur }) {
  return (
    <select
      autoFocus={autoFocus}
      onBlur={onBlur}
      className={cellInput}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/** A cell that displays a value in view mode and turns into an editor on click. */
function EditableCell({ value, display, onCommit, type = "text", options }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  function commit(v) {
    setEditing(false);
    if (v !== value) onCommit(v);
  }

  if (editing) {
    if (options) {
      return (
        <Select
          autoFocus
          value={draft}
          onChange={(v) => { setDraft(v); commit(v); }}
          onBlur={() => setEditing(false)}
          options={options}
        />
      );
    }
    return (
      <input
        autoFocus
        type={type}
        className={cellInput}
        value={draft ?? ""}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(type === "number" ? (draft === "" ? null : Number(draft)) : draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(value ?? ""); setEditing(false); }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="block w-full min-h-9 rounded px-2 py-1 text-left text-xs hover:bg-accent/60 focus:outline-none focus:ring-1 focus:ring-ring"
      title="Click to edit"
    >
      {display ?? (value === "" || value == null ? <span className="text-muted-foreground">—</span> : String(value))}
    </button>
  );
}

function BoolCell({ value, onCommit }) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className="h-5 w-5 cursor-pointer"
        checked={!!value}
        onChange={(e) => onCommit(e.target.checked)}
      />
    </div>
  );
}

function EditDialog({ open, onOpenChange, record, onSave }) {
  const [form, setForm] = useState(record ?? empty());
  const [auditOpen, setAuditOpen] = useState(false);
  useEffect(() => { if (record) setForm(record); }, [record]);

  if (!record) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Compute current risk to determine if approval is required
  const computed = classifyRisk(form);
  const isHighRisk = computed.risk === "HIGH";

  // For HIGH risk: force kyc_status to ENHANCED_DUE_DILIGENCE
  const effectiveKycStatus = isHighRisk ? "ENHANCED_DUE_DILIGENCE" : form.kyc_status;
  
  // For HIGH risk: filter out APPROVED from KYC options
  const kycOptions = isHighRisk 
    ? KYC.filter(k => k !== "APPROVED")
    : KYC;

  const Field = ({ label, children }) => (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit client — {record.client_id}</DialogTitle>
          {record.lastUpdatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated at {new Date(record.lastUpdatedAt).toLocaleString()}
            </p>
          )}
        </DialogHeader>

        {/* Show approval badge if HIGH risk */}
        {isHighRisk && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <ApprovalBadge requiresApproval={true} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Client ID"><input className={cellInput} value={form.client_id ?? ""} disabled /></Field>
          <Field label="Name"><input className={cellInput} value={form.client_name ?? ""} onChange={(e) => set("client_name", e.target.value)} /></Field>
          <Field label="Branch"><input className={cellInput} value={form.branch ?? ""} onChange={(e) => set("branch", e.target.value)} /></Field>
          <Field label="Onboarding Date"><input type="date" className={cellInput} value={form.onboarding_date ?? ""} onChange={(e) => set("onboarding_date", e.target.value)} /></Field>
          <Field label="Type"><Select value={form.client_type} onChange={(v) => set("client_type", v)} options={["INDIVIDUAL", "ENTITY"]} /></Field>
          <Field label="Country"><Select value={form.country_of_tax_residence} onChange={(v) => set("country_of_tax_residence", v)} options={COUNTRIES} /></Field>
          <Field label="Annual Income"><input type="number" className={cellInput} value={form.annual_income ?? ""} onChange={(e) => set("annual_income", e.target.value === "" ? null : Number(e.target.value))} /></Field>
          <Field label="Source of Funds"><Select value={form.source_of_funds} onChange={(v) => set("source_of_funds", v)} options={SOURCES} /></Field>
          <Field label="KYC Status">
            {isHighRisk ? (
              <div className="flex items-center gap-2">
                <input 
                  className={cellInput} 
                  value={effectiveKycStatus} 
                  disabled 
                />
                <span className="text-xs text-muted-foreground">Enforced for HIGH risk</span>
              </div>
            ) : (
              <Select value={form.kyc_status} onChange={(v) => set("kyc_status", v)} options={kycOptions} />
            )}
          </Field>
          <Field label="Relationship Manager"><input className={cellInput} value={form.relationship_manager ?? ""} onChange={(e) => set("relationship_manager", e.target.value)} /></Field>
          <Field label="ID Verification Date"><input type="date" className={cellInput} value={form.id_verification_date ?? ""} onChange={(e) => set("id_verification_date", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4" checked={!!form.pep_status} onChange={(e) => set("pep_status", e.target.checked)} /> PEP</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4" checked={!!form.sanctions_screening_match} onChange={(e) => set("sanctions_screening_match", e.target.checked)} /> Sanctions Match</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4" checked={!!form.adverse_media_flag} onChange={(e) => set("adverse_media_flag", e.target.checked)} /> Adverse Media</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4" checked={!!form.documentation_complete} onChange={(e) => set("documentation_complete", e.target.checked)} /> Documentation Complete</label>
          </div>
        </div>
        
        {/* Buttons - Above Audit Trail */}
        <div className="flex gap-2 border-t border-border pt-4">
          <button 
            onClick={() => onOpenChange(false)} 
            className="min-h-9 rounded-md border border-input bg-background px-4 text-xs font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => { 
              // If HIGH risk, force kyc_status to ENHANCED_DUE_DILIGENCE before saving
              const toSave = isHighRisk 
                ? { ...form, kyc_status: "ENHANCED_DUE_DILIGENCE" }
                : form;
              onSave(toSave); 
              onOpenChange(false); 
            }}
            className="min-h-9 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>

        {/* Audit Trail Accordion */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setAuditOpen(!auditOpen)}
            className="flex w-full items-center justify-between rounded-md bg-muted/50 p-3 hover:bg-muted"
          >
            <span className="text-xs font-semibold text-foreground">Audit Trail</span>
            {auditOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {auditOpen && (
            <div className="mt-3 rounded-md border border-border bg-muted/20 p-4">
              <AuditTrail record={record} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function IntakeTable({ records, onDelete, onUpdate }) {
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState(() => new Set());
  const [editing, setEditing] = useState(null); // record being edited in dialog

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function saveEdit(updatedRecord) {
    const original = records.find((r) => r.client_id === updatedRecord.client_id);
    if (!original) return;
    Object.keys(updatedRecord).forEach((k) => {
      if (updatedRecord[k] !== original[k]) onUpdate(updatedRecord.client_id, k, updatedRecord[k]);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {records.length} record{records.length === 1 ? "" : "s"}. Click any cell to edit, expand a row for more fields, or use <strong>Edit</strong> for the full form.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {Object.entries(errors).map(([k, v]) => (
            <div key={k}><strong>{k}</strong>: {v}</div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-left uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2"></th>
              <th className="px-2 py-2">Client ID *</th>
              <th className="px-2 py-2">Name *</th>
              <th className="px-2 py-2">Country</th>
              <th className="px-2 py-2">Income</th>
              <th className="px-2 py-2">KYC</th>
              <th className="px-2 py-2 text-center">PEP</th>
              <th className="px-2 py-2 text-center">Sanc</th>
              <th className="px-2 py-2">Risk</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isOpen = expanded.has(r.client_id);
              return (
                <>
                  <tr key={r.client_id} className="border-t border-border">
                    <td className="px-2 py-2">
                      <button
                        onClick={() => toggleExpand(r.client_id)}
                        className="rounded p-1 hover:bg-accent"
                        aria-label={isOpen ? "Collapse details" : "Expand details"}
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-2 py-2 font-mono">{r.client_id}</td>
                    <td className="px-2 py-2">
                      <EditableCell value={r.client_name} onCommit={(v) => onUpdate(r.client_id, "client_name", v)} />
                    </td>
                    <td className="px-2 py-2">
                      <EditableCell value={r.country_of_tax_residence} options={COUNTRIES} onCommit={(v) => onUpdate(r.client_id, "country_of_tax_residence", v)} />
                    </td>
                    <td className="px-2 py-2">
                      <EditableCell value={r.annual_income} type="number" onCommit={(v) => onUpdate(r.client_id, "annual_income", v)} />
                    </td>
                    <td className="px-2 py-2">
                      <EditableCell value={r.kyc_status} options={KYC} onCommit={(v) => onUpdate(r.client_id, "kyc_status", v)} />
                    </td>
                    <td className="px-2 py-2">
                      <BoolCell value={r.pep_status} onCommit={(v) => onUpdate(r.client_id, "pep_status", v)} />
                    </td>
                    <td className="px-2 py-2">
                      <BoolCell value={r.sanctions_screening_match} onCommit={(v) => onUpdate(r.client_id, "sanctions_screening_match", v)} />
                    </td>
                    <td className="px-2 py-2"><RiskBadge level={r.computed_risk} /></td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex flex-col items-end justify-between gap-2">
                        {r.computed_risk === "HIGH" && (
                          <ApprovalBadge requiresApproval={true} />
                        )}
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditing(r)}
                            className="inline-flex min-h-8 items-center gap-1 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(r.client_id)}
                            className="min-h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr key={`${r.client_id}-details`} className="border-t border-border bg-muted/30">
                      <td></td>
                      <td colSpan={9} className="px-3 py-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                          <DetailField label="Branch">
                            <EditableCell value={r.branch} onCommit={(v) => onUpdate(r.client_id, "branch", v)} />
                          </DetailField>
                          <DetailField label="Onboarding Date">
                            <EditableCell value={r.onboarding_date} type="date" onCommit={(v) => onUpdate(r.client_id, "onboarding_date", v)} />
                          </DetailField>
                          <DetailField label="Type">
                            <EditableCell value={r.client_type} options={["INDIVIDUAL", "ENTITY"]} onCommit={(v) => onUpdate(r.client_id, "client_type", v)} />
                          </DetailField>
                          <DetailField label="Source of Funds">
                            <EditableCell value={r.source_of_funds} options={SOURCES} onCommit={(v) => onUpdate(r.client_id, "source_of_funds", v)} />
                          </DetailField>
                          <DetailField label="Relationship Mgr">
                            <EditableCell value={r.relationship_manager} onCommit={(v) => onUpdate(r.client_id, "relationship_manager", v)} />
                          </DetailField>
                          <DetailField label="ID Verification">
                            <EditableCell value={r.id_verification_date} type="date" onCommit={(v) => onUpdate(r.client_id, "id_verification_date", v)} />
                          </DetailField>
                          <DetailField label="Adverse Media">
                            <BoolCell value={r.adverse_media_flag} onCommit={(v) => onUpdate(r.client_id, "adverse_media_flag", v)} />
                          </DetailField>
                          <DetailField label="Docs Complete">
                            <BoolCell value={r.documentation_complete} onCommit={(v) => onUpdate(r.client_id, "documentation_complete", v)} />
                          </DetailField>
                          {r.computed_reasons?.length > 0 && (
                            <div className="col-span-full text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Risk reasons: </span>
                              {r.computed_reasons.join(", ")}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No records yet. Add one above or import a CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        record={editing}
        onSave={saveEdit}
      />
    </div>
  );
}

function DetailField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
