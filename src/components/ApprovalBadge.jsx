import { AlertCircle } from "lucide-react";

export function ApprovalBadge({ requiresApproval }) {
  if (!requiresApproval) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 border border-amber-200">
      <AlertCircle className="h-3.5 w-3.5" />
      Requires Compliance Approval
    </div>
  );
}
