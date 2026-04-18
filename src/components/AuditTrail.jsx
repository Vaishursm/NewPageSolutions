import { display } from "@/utils/validation";

export function AuditTrail({ record }) {
  if (!record.change_log || record.change_log.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No audit log available for this record.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...record.change_log].reverse().map((log, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1 border-l-2 border-border py-2 pl-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{log.action}</span>
            <span className="text-muted-foreground">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="text-muted-foreground">
            <span>By: {log.changed_by}</span>
          </div>
          {log.field !== "all" && (
            <div className="text-muted-foreground">
              <span className="font-mono text-[10px]">{log.field}</span>
              {log.old_value !== null && (
                <>
                  {" "}
                  <span>
                    {display(log.old_value)} → {display(log.new_value)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
