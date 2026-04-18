import { RiskBadge } from "@/components/RiskBadge";

export function EDDStatus({ record, onUpdateEDD }) {
  const isHighRisk = record.computed_risk === "HIGH";
  const eddApproved = record.edd_status === "APPROVED";
  const eddPending = record.edd_status === "PENDING";

  if (!isHighRisk) {
    return (
      <div className="text-xs text-muted-foreground">
        Not applicable — client is {record.computed_risk} risk
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <RiskBadge level="HIGH" />
        <span className="text-xs font-semibold text-foreground">
          Enhanced Due Diligence Required
        </span>
      </div>

      <div className="rounded-lg border border-warning bg-warning/10 p-3">
        <p className="text-xs text-foreground">
          <strong>EDD Status:</strong>{" "}
          <span
            className={`font-semibold ${
              eddApproved
                ? "text-risk-low"
                : eddPending
                  ? "text-warning"
                  : "text-destructive"
            }`}
          >
            {record.edd_status || "NOT_INITIATED"}
          </span>
        </p>

        {record.edd_approval_date && (
          <p className="mt-1 text-xs text-muted-foreground">
            Approved: {new Date(record.edd_approval_date).toLocaleDateString()}
          </p>
        )}

        {record.edd_approved_by && (
          <p className="text-xs text-muted-foreground">
            By: {record.edd_approved_by}
          </p>
        )}

        {(eddPending || !record.edd_status) && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() =>
                onUpdateEDD(record.client_id, "PENDING", null, null)
              }
              className="rounded-md border border-warning bg-warning/5 px-2 py-1 text-xs hover:bg-warning/10"
            >
              Mark as Pending
            </button>
            <button
              onClick={() =>
                onUpdateEDD(
                  record.client_id,
                  "APPROVED",
                  new Date().toISOString(),
                  "Senior Compliance Officer"
                )
              }
              className="rounded-md bg-risk-low px-2 py-1 text-xs font-semibold text-white hover:bg-risk-low/90"
            >
              Approve EDD
            </button>
          </div>
        )}
      </div>

      {record.edd_comments && (
        <div className="rounded-lg border border-border bg-muted/20 p-2">
          <p className="text-[11px] font-semibold text-foreground">Comments:</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {record.edd_comments}
          </p>
        </div>
      )}
    </div>
  );
}
