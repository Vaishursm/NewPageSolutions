import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseCSV } from "@/utils/csvParser";
import { classifyRisk } from "@/utils/riskEngine";
import { validationStatus } from "@/utils/validation";
import { generateSampleCSV, validateCSVHeaders } from "@/utils/sampleData";
import { IntakeTable } from "@/components/IntakeTable";
import { Filters } from "@/components/Filters";
import { Report } from "@/components/Report";
import { AddClientForm } from "@/components/AddClientForm";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  component: SentinelApp,
  head: () => ({
    meta: [
      { title: "SENTINEL — Client Onboarding Risk Assessment" },
      { name: "description", content: "Onboarding risk classification and audit dashboard for wealth management." },
    ],
  }),
});

const TABS = [
  { id: "add", label: "Intake Form" },
  { id: "dashboard", label: "Dashboard" },
  { id: "report", label: "Report" },
];

function enrichFromCSVRow(row) {
  const computed = classifyRisk(row);
  const now = new Date().toISOString();
  return {
    ...row,
    created_at: now,
    updated_at: now,
    lastUpdatedAt: now,
    input_snapshot: { ...row },
    computed_risk: computed.risk,
    computed_reasons: computed.reasons,
    validation_status: validationStatus(row),
    risk_classification: row.risk_classification ?? null,
    change_log: [
      {
        timestamp: now,
        action: "IMPORTED_FROM_CSV",
        field: "all",
        old_value: null,
        new_value: "CSV import",
        changed_by: "System",
      },
    ],
  };
}

function SentinelApp() {
  const [records, setRecords] = useLocalStorage("sentinel.records", []);
  const [tab, setTab] = useState("dashboard");
  const [filters, setFilters] = useState({ branch: "", rm: "", risk: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

  function handleAdd(record) {
    const now = new Date().toISOString();
    const enriched = {
      ...record,
      updated_at: now,
      lastUpdatedAt: now,
      change_log: record.change_log || [
        {
          timestamp: now,
          action: "CREATED",
          field: "all",
          old_value: null,
          new_value: "New client created",
          changed_by: "Relationship Manager",
        },
      ],
    };
    setRecords((prev) => [enriched, ...prev]);
    setTab("dashboard");
  }

  function handleDelete(id) {
    setRecords((prev) => prev.filter((r) => r.client_id !== id));
  }

  function handleUpdateEDD(id, status, approvalDate, approvedBy) {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.client_id !== id) return r;
        const updated = {
          ...r,
          edd_status: status,
          edd_approval_date: approvalDate,
          edd_approved_by: approvedBy,
          updated_at: new Date().toISOString(),
        };

        updated.change_log = updated.change_log || [];
        updated.change_log.push({
          timestamp: updated.updated_at,
          action: "EDD_STATUS_UPDATED",
          field: "edd_status",
          old_value: r.edd_status,
          new_value: status,
          changed_by: approvedBy || "System",
        });

        return updated;
      }),
    );
  }

  function handleUpdate(id, field, value) {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.client_id !== id) return r;
        const old_value = r[field];
        const now = new Date().toISOString();
        const updated = { ...r, [field]: value, updated_at: now, lastUpdatedAt: now };
        const { risk, reasons } = classifyRisk(updated);
        updated.computed_risk = risk;
        updated.computed_reasons = reasons;
        updated.validation_status = validationStatus(updated);
        
        // Add to change log
        updated.change_log = updated.change_log || [];
        updated.change_log.push({
          timestamp: updated.updated_at,
          action: "FIELD_UPDATED",
          field,
          old_value,
          new_value: value,
          changed_by: "Relationship Manager",
        });
        
        return updated;
      }),
    );
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    // Validate headers
    const validation = validateCSVHeaders(headers);
    if (!validation.isValid) {
      setImportMsg(
        `❌ Missing headers: ${validation.missing.join(", ")}. Please use the sample CSV format.`
      );
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setRecords((prev) => {
      const existingIds = new Set(prev.map((r) => r.client_id));
      const additions = [];
      let skipped = 0;
      let autoId = 1;
      const nextAutoId = () => {
        let id;
        do {
          id = `AUTO-${String(autoId++).padStart(4, "0")}`;
        } while (existingIds.has(id));
        return id;
      };
      for (const row of rows) {
        const r = { ...row };
        if (!r.client_id) r.client_id = nextAutoId();
        if (existingIds.has(r.client_id)) {
          skipped++;
          continue;
        }
        existingIds.add(r.client_id);
        additions.push(enrichFromCSVRow(r));
      }
      setImportMsg(
        `✅ Imported ${additions.length} records${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : ""}.`,
      );
      return [...additions, ...prev];
    });

    if (fileRef.current) fileRef.current.value = "";
  }

  function clearAll() {
    if (confirm("Delete ALL records?")) setRecords([]);
  }

  function downloadSampleCSV() {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_onboarding.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filters.branch && r.branch !== filters.branch) return false;
      if (filters.rm && r.relationship_manager !== filters.rm) return false;
      if (filters.risk && r.computed_risk !== filters.risk) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          (r.client_id?.toLowerCase().includes(search)) ||
          (r.client_name?.toLowerCase().includes(search)) ||
          (r.branch?.toLowerCase().includes(search)) ||
          (r.relationship_manager?.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [records, filters, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Logo />
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-4 py-2">
            <span className="text-sm font-semibold text-foreground">{records.length}</span>
            <span className="text-xs text-muted-foreground">records</span>
          </div>
        </div>
        {importMsg && (
          <div className="bg-muted/60 px-6 py-3 text-sm text-muted-foreground border-t border-border">{importMsg}</div>
        )}
        <nav className="mx-auto flex max-w-7xl gap-0 px-6 border-t border-border/50">
          {TABS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none min-h-14 px-6 text-sm font-semibold border-b-2 transition-all ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {tab === "add" && (
          <section className="w-full">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">Add New Client</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete the form below to onboard a new client. All fields are required.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white shadow-sm p-4">
              <AddClientForm records={records} onAdd={handleAdd} />
            </div>
          </section>
        )}

        {tab === "dashboard" && (
          <section className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Client Dashboard</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                View and manage all client records. Use filters to focus on specific clients, click cells to edit inline, or use Edit for comprehensive changes.
              </p>
            </div>

            {/* CSV Actions - Top Right */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  <span className="text-primary">{filtered.length}</span> of <span className="text-muted-foreground">{records.length}</span> records
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center justify-center min-h-10 px-4 rounded-md border border-border bg-white hover:bg-muted/50 text-sm font-medium transition-colors"
                  title="Import clients from CSV file"
                >
                  Import CSV
                </button>
                <button
                  onClick={downloadSampleCSV}
                  className="inline-flex items-center justify-center min-h-10 px-4 rounded-md border border-border bg-white hover:bg-muted/50 text-sm font-medium transition-colors"
                  title="Download sample CSV template"
                >
                  Download Sample
                </button>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center justify-center min-h-10 px-4 rounded-md border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-sm font-medium text-destructive transition-colors"
                  title="Delete all records"
                >
                  Clear All Data
                </button>
              </div>
            </div>

            {/* Filters and Search Box */}
            <div className="rounded-lg border border-border bg-white shadow-sm p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by name, client ID, branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <Filters records={records} filters={filters} setFilters={setFilters} />
            </div>

            {records.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <p className="text-lg font-semibold text-foreground">No clients yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start by adding a new client using the Intake Form tab or importing a CSV file.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                <p className="text-lg font-semibold text-foreground">No matches found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No records match your current filters.
                </p>
                <button
                  onClick={() => setFilters({ branch: "", rm: "", risk: "" })}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
                  <IntakeTable records={filtered} onDelete={handleDelete} onUpdate={handleUpdate} />
                </div>
                
                {filtered.length > 0 && (
                  <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/2 p-6">
                    <h3 className="mb-4 text-sm font-bold text-foreground">Quick Insights</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-md bg-white/60 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Records</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{filtered.length}</p>
                      </div>
                      <div className="rounded-md bg-white/60 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">High Risk</p>
                        <p className="mt-2 text-3xl font-bold text-risk-high">{filtered.filter((r) => r.computed_risk === "HIGH").length}</p>
                      </div>
                      <div className="rounded-md bg-white/60 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Medium Risk</p>
                        <p className="mt-2 text-3xl font-bold text-risk-medium">{filtered.filter((r) => r.computed_risk === "MEDIUM").length}</p>
                      </div>
                      <div className="rounded-md bg-white/60 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Risk Mismatches</p>
                        <p className="mt-2 text-3xl font-bold text-destructive">
                          {filtered.filter((r) => r.risk_classification && r.computed_risk && r.risk_classification !== r.computed_risk).length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {tab === "report" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Audit & Compliance Report</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Comprehensive audit trail and compliance metrics for regulatory file reviews.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
              <Report records={records} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
