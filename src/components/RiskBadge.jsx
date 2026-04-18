export function RiskBadge({ level }) {
  const map = {
    HIGH: "bg-risk-high text-risk-high-foreground",
    MEDIUM: "bg-risk-medium text-risk-medium-foreground",
    LOW: "bg-risk-low text-risk-low-foreground",
    PENDING: "bg-risk-pending text-risk-pending-foreground",
  };
  const cls = map[level] || "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${cls}`}
    >
      {level || "-"}
    </span>
  );
}
