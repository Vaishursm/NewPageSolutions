import { RiskBadge } from "./RiskBadge";
import { hasCriticalFields, CRITICAL_FIELDS } from "@/utils/riskEngine";

function countBy(records, key) {
  const out = { HIGH: 0, MEDIUM: 0, LOW: 0, PENDING: 0 };
  for (const r of records) {
    const v = r[key];
    if (v && out[v] !== undefined) out[v]++;
  }
  return out;
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export function Report({ records }) {
  const computed = countBy(records, "computed_risk");
  const csv = countBy(records, "risk_classification");
  const mismatched = records.filter(
    (r) => r.risk_classification && r.computed_risk && r.risk_classification !== r.computed_risk
  );
  const missing = records.filter((r) => !hasCriticalFields(r));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total records" value={records.length} />
        <Stat label="Mismatched" value={mismatched.length} />
        <Stat label="Missing critical fields" value={missing.length} />
        <Stat label="High risk (computed)" value={computed.HIGH} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Risk distribution — Computed</h3>
          <div className="space-y-2">
            {["HIGH", "MEDIUM", "LOW", "PENDING"].map((k) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <RiskBadge level={k} />
                <span className="font-mono">{computed[k]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Risk distribution — CSV (original)</h3>
          <div className="space-y-2">
            {["HIGH", "MEDIUM", "LOW", "PENDING"].map((k) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <RiskBadge level={k} />
                <span className="font-mono">{csv[k]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Mismatched records ({mismatched.length})</h3>
        {mismatched.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mismatches between CSV and computed risk.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {mismatched.map((r) => (
              <li key={r.client_id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">{r.client_id}</span>
                <span>{r.client_name}</span>
                <span className="text-muted-foreground">CSV:</span>
                <RiskBadge level={r.risk_classification} />
                <span className="text-muted-foreground">Computed:</span>
                <RiskBadge level={r.computed_risk} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Records missing critical fields ({missing.length})</h3>
        {missing.length === 0 ? (
          <p className="text-sm text-muted-foreground">All records have the critical fields needed for risk classification.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {missing.map((r) => {
              const miss = CRITICAL_FIELDS.filter((f) => r[f] === undefined || r[f] === null || r[f] === "");
              return (
                <li key={r.client_id}>
                  <span className="font-mono text-xs">{r.client_id}</span> — {r.client_name || "(no name)"} —{" "}
                  <span className="text-muted-foreground">missing: {miss.join(", ")}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
