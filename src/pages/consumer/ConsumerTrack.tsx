import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Clock, Search, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { complaintService } from "@/services/inspection/complaintService";
import { ISSUE_TYPE_LABELS } from "@/types/complaint";

export default function ConsumerTrack() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get("id") || "";

  const [complaintId, setComplaintId] = useState(idParam);
  const [searchedId, setSearchedId] = useState(idParam);

  const complaint = useMemo(() => {
    if (!searchedId) return null;
    return complaintService.get(searchedId);
  }, [searchedId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    setSearchedId(complaintId.trim());
    setSearchParams({ id: complaintId.trim() });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Track Your Complaint"
        description="Monitor the real-time review, investigation and resolution of your reported issue."
      />

      <Card className="max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block">
            <span className="block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8] mb-1.5">
              Grievance Reference ID
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder="e.g. CMP-2026-000041"
                className="w-full border border-white/12 bg-[#0B111C] px-3.5 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none placeholder:text-[#475569] focus:border-[#F59E0B]"
              />
              <Button type="submit" variant="primary" size="md">
                <Search className="h-4 w-4" />
                Track
              </Button>
            </div>
          </label>
        </form>
      </Card>

      {searchedId && !complaint && (
        <Card className="max-w-xl mx-auto text-center py-12">
          <AlertTriangle className="h-8 w-8 text-[#F59E0B] mx-auto mb-3" />
          <h3 className="font-display text-lg text-[#F0F2F5]">Grievance Not Found</h3>
          <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
            The reference ID <code className="font-mono text-[#F0F2F5]">{searchedId}</code> could not be found
            in our public database. Please verify the ID or try again.
          </p>
        </Card>
      )}

      {complaint && (
        <div className="grid gap-6 md:grid-cols-[1.35fr_0.65fr] max-w-4xl mx-auto">
          {/* Main Case Flow */}
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
                <div>
                  <span className="font-mono text-[0.62rem] text-[#64748B]">Reference ID</span>
                  <h2 className="font-mono text-xl text-[#F0F2F5] mt-1">{complaint.complaintId}</h2>
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-3 font-mono text-[0.72rem] text-[#94A3B8] sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-wider text-[#64748B]">Issue category</dt>
                  <dd className="mt-1 text-sm text-[#F0F2F5]">{ISSUE_TYPE_LABELS[complaint.issueType]}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-[#64748B]">Product name</dt>
                  <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.productName}</dd>
                </div>
                {complaint.brand && (
                  <div>
                    <dt className="uppercase tracking-wider text-[#64748B]">Brand</dt>
                    <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.brand}</dd>
                  </div>
                )}
                {complaint.purchaseLocation && (
                  <div>
                    <dt className="uppercase tracking-wider text-[#64748B]">Location</dt>
                    <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.purchaseLocation}</dd>
                  </div>
                )}
              </dl>

              {complaint.description && (
                <div className="mt-6 border-t border-white/8 pt-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[#64748B]">
                    Grievance Description
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#F0F2F5]/90">
                    {complaint.description}
                  </p>
                </div>
              )}
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="font-display text-lg text-[#F0F2F5] border-b border-white/8 pb-3 mb-5">
                Case Activity Timeline
              </h3>
              <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-6">
                {complaint.events.map((evt) => (
                  <div key={evt.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-[#080C14] border-2 border-[#F59E0B]" />
                    <p className="font-mono text-[0.55rem] text-[#64748B]">
                      {new Date(evt.timestamp).toLocaleString()} · {evt.actorName} ({evt.actorRole})
                    </p>
                    <h4 className="font-display text-sm text-[#F0F2F5] mt-1">{evt.title}</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">{evt.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Info Requests */}
            {complaint.infoRequests.length > 0 && (
              <Card className="border-[#F59E0B]/35 bg-[#F59E0B]/5">
                <h3 className="font-display text-lg text-[#F59E0B] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Action Required: More Information Requested
                </h3>
                <div className="divide-y divide-white/6 mt-4">
                  {complaint.infoRequests.map((req) => (
                    <div key={req.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        &ldquo;{req.requestReason}&rdquo;
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {req.requestedItems.map((item) => (
                          <li key={item} className="flex items-center gap-2 font-mono text-[0.7rem] text-[#94A3B8]">
                            <span className="h-1.5 w-1.5 bg-[#F59E0B] rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 font-mono text-[0.58rem] text-[#64748B]">
                        Requested by {req.officerName} on {new Date(req.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Status Panel */}
          <aside className="space-y-6">
            <Card>
              <h3 className="font-display text-base text-[#F0F2F5] mb-2">Resolution Status</h3>
              {complaint.status === "RESOLVED" && complaint.resolution ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#10B981] font-mono text-xs uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    Case Resolved
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#10B981]/5 border border-[#10B981]/20 p-3">
                    {complaint.resolution.notes}
                  </p>
                  <p className="font-mono text-[0.58rem] text-[#64748B]">
                    Closed on {new Date(complaint.resolution.resolvedAt).toLocaleString()}
                  </p>
                </div>
              ) : complaint.status === "REJECTED" && complaint.resolution ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#EF4444] font-mono text-xs uppercase tracking-wider">
                    <XCircle className="h-4 w-4" />
                    Case Rejected
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#EF4444]/5 border border-[#EF4444]/20 p-3">
                    {complaint.resolution.notes}
                  </p>
                  <p className="font-mono text-[0.58rem] text-[#64748B]">
                    Closed on {new Date(complaint.resolution.resolvedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#F59E0B] font-mono text-xs uppercase tracking-wider animate-pulse">
                    <Clock className="h-4 w-4" />
                    Investigation Active
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    This case is currently allocated to an inspecting officer. Visual evidence and
                    commodity details are under verification.
                  </p>
                </div>
              )}
            </Card>

            {complaint.linkedInspectionId && (
              <Card className="border-[#10B981]/35 bg-[#10B981]/5">
                <h3 className="font-display text-base text-[#10B981] flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  Investigation Link
                </h3>
                <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
                  This complaint has triggered an official metrology investigation.
                </p>
                <div className="mt-4 font-mono text-[0.66rem] text-[#CBD5E1]">
                  <p>Inspection Reference ID:</p>
                  <p className="text-[#F59E0B] mt-1 font-semibold">{complaint.linkedInspectionId}</p>
                </div>
              </Card>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
export function XCircle({ className }: { className?: string }) {
  return <XCircleIcon className={className} />;
}
import { XCircle as XCircleIcon } from "lucide-react";
