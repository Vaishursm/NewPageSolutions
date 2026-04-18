export function Filters({ records, filters, setFilters }) {
  const branches = [...new Set(records.map((r) => r.branch).filter(Boolean))].sort();
  const rms = [...new Set(records.map((r) => r.relationship_manager).filter(Boolean))].sort();
  const risks = ["HIGH", "MEDIUM", "LOW", "PENDING"];

  const sel =
    "min-h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex flex-wrap gap-3">
      <select className={sel} value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}>
        <option value="">All Branches</option>
        {branches.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>
      <select className={sel} value={filters.rm} onChange={(e) => setFilters({ ...filters, rm: e.target.value })}>
        <option value="">All Relationship Managers</option>
        {rms.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <select className={sel} value={filters.risk} onChange={(e) => setFilters({ ...filters, risk: e.target.value })}>
        <option value="">All Risk Levels</option>
        {risks.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {(filters.branch || filters.rm || filters.risk) && (
        <button
          onClick={() => setFilters({ branch: "", rm: "", risk: "" })}
          className="min-h-11 rounded-md border border-input bg-background px-4 text-sm hover:bg-accent"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
