import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Dialog } from "@/components/design-system/Dialog";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { complaintService } from "@/services/inspection/complaintService";
import { StorageError } from "@/services/storage";
import { useAuth } from "@/context/AuthContext";
import { ISSUE_TYPE_LABELS, type ComplaintCase } from "@/types/complaint";

/** Inline, accessible error line shown inside an action dialog. */
function DialogError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-[0.78rem] text-[#F0F2F5]"
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EF4444]" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function OfficerComplaintDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<ComplaintCase | null>(null);
  const [activeEvidence, setActiveEvidence] = useState(0);

  // Modals
  const [infoOpen, setInfoOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  // Form states
  const [infoReason, setInfoReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    "Product label photo": false,
    "Close-up of printed price": false,
    "Clear image of best before date": false,
    "Copy of retail purchase receipt": false,
  });

  const [resolveNotes, setResolveNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setComplaint(complaintService.get(id));
  }, [id]);

  const refreshCase = () => {
    setComplaint(complaintService.get(id));
  };

  /** Converts any thrown value into a message safe to show an officer. */
  const describeFailure = (err: unknown): string =>
    err instanceof StorageError
      ? err.message
      : "This action could not be completed. Please try again.";

  const handleRequestInfo = async () => {
    if (!complaint || !user) return;
    const items = Object.entries(selectedItems)
      .filter(([, checked]) => checked)
      .map(([name]) => name);

    if (items.length === 0 || !infoReason.trim()) {
      setFormError("Select at least one item and give a short reason.");
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      await complaintService.requestMoreInfo(complaint.id, infoReason, user.name, items);
      setInfoOpen(false);
      setInfoReason("");
      setSelectedItems({
        "Product label photo": false,
        "Close-up of printed price": false,
        "Clear image of best before date": false,
        "Copy of retail purchase receipt": false,
      });
      refreshCase();
    } catch (err) {
      console.error("Request for information failed:", err);
      setFormError(describeFailure(err));
    } finally {
      setBusy(false);
    }
  };

  const closeCase = async (outcome: "RESOLVED" | "REJECTED", notes: string) => {
    if (!complaint || !user || !notes.trim()) return;
    setBusy(true);
    setFormError(null);
    try {
      await complaintService.updateStatus(complaint.id, outcome, user.name, notes);
      setResolveOpen(false);
      setRejectOpen(false);
      setResolveNotes("");
      setRejectNotes("");
      refreshCase();
    } catch (err) {
      console.error("Case status update failed:", err);
      setFormError(describeFailure(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = () => closeCase("RESOLVED", resolveNotes);
  const handleReject = () => closeCase("REJECTED", rejectNotes);

  const handleConvert = async () => {
    if (!complaint || !user) return;
    setBusy(true);
    setFormError(null);
    try {
      const result = await complaintService.convertComplaintToInspection(
        complaint.id,
        user.id,
        user.name,
      );
      setConvertOpen(false);
      // Open the pre-filled inspection draft so the officer continues in place.
      navigate(`/officer/inspections/new?draft=${result.inspectionDraftId}`);
    } catch (err) {
      console.error("Complaint to inspection conversion failed:", err);
      setFormError(describeFailure(err));
    } finally {
      setBusy(false);
    }
  };

  if (!complaint) {
    return (
      <Card className="text-center py-16">
        <AlertTriangle className="h-8 w-8 text-[#F59E0B] mx-auto mb-3" />
        <h3 className="font-display text-lg text-[#F0F2F5]">Grievance Not Found</h3>
        <p className="mt-2 text-xs text-[#94A3B8]">This case is not registered in local storage.</p>
        <div className="mt-6">
          <Link to="/officer/complaints">
            <Button variant="secondary" size="sm">
              Back to complaints
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const evidence = complaint.evidence[activeEvidence];
  const isClosed = complaint.status === "RESOLVED" || complaint.status === "REJECTED";

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={["Inspection Officer", "Assigned Complaints", "Case Detail"]}
        title={complaint.complaintId}
        description={ISSUE_TYPE_LABELS[complaint.issueType]}
        action={
          <Link to="/officer/complaints">
            <Button variant="outline" size="sm">
              Back to list
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          {/* Main Case Card */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <span className="font-mono text-[0.58rem] uppercase tracking-wider text-[#64748B]">
                  Product Name
                </span>
                <CardTitle className="mt-1 text-lg">{complaint.productName}</CardTitle>
                <CardDescription>Brand: {complaint.brand || "—"}</CardDescription>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-3 font-mono text-[0.72rem] text-[#94A3B8] sm:grid-cols-2">
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Batch / Lot number</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.batchNumber || "—"}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Purchase Location</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.purchaseLocation || "—"}</dd>
              </div>
              {complaint.mrp && (
                <div>
                  <dt className="uppercase tracking-wider text-[#64748B]">Reported MRP</dt>
                  <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.mrp}</dd>
                </div>
              )}
              {complaint.purchaseDate && (
                <div>
                  <dt className="uppercase tracking-wider text-[#64748B]">Purchase Date</dt>
                  <dd className="mt-1 text-sm text-[#F0F2F5]">{complaint.purchaseDate}</dd>
                </div>
              )}
            </dl>

            {complaint.description && (
              <div className="mt-6 border-t border-white/8 pt-4">
                <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[#64748B]">
                  Consumer Problem Description
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#F0F2F5]/90">
                  {complaint.description}
                </p>
              </div>
            )}
          </Card>

          {/* Evidence Viewer */}
          <Card>
            <h3 className="font-display text-lg text-[#F0F2F5] mb-2">Submitted evidence</h3>
            {complaint.evidence.length === 0 ? (
              <div className="grid place-items-center border border-dashed border-white/10 py-10 text-center bg-black/10">
                <AlertTriangle className="h-6 w-6 text-[#F59E0B] opacity-60" />
                <p className="mt-2 text-sm text-[#94A3B8]">No consumer evidence attached to this case.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {complaint.evidence.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveEvidence(index)}
                      className={`min-h-[36px] border px-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition ${
                        index === activeEvidence ? "border-[#F59E0B]/40 text-[#F59E0B]" : "border-white/10 text-[#94A3B8]"
                      }`}
                    >
                      {item.kind} ({item.source})
                    </button>
                  ))}
                </div>
                {evidence && (
                  <figure className="border border-white/10 overflow-hidden bg-black/20 rounded">
                    <img src={evidence.previewUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"} alt="Consumer evidence" className="max-h-96 w-full object-contain" />
                    <figcaption className="px-4 py-2.5 border-t border-white/6 flex items-center justify-between gap-4 font-mono text-[0.64rem] text-[#94A3B8]">
                      <span>File: {evidence.fileName}</span>
                      <span>Source: {evidence.source}</span>
                    </figcaption>
                  </figure>
                )}
              </>
            )}
          </Card>

          {/* AI Assistance Mock section */}
          <Card>
            <h3 className="font-display text-lg text-[#F0F2F5] mb-1">AI evidence assistant</h3>
            <p className="text-xs text-[#64748B] font-mono uppercase tracking-wider">Assistive analysis</p>
            <div className="mt-4 flex items-start gap-3 border border-white/10 bg-white/[0.02] p-4 text-xs text-[#94A3B8]">
              <Info className="h-4.5 w-4.5 shrink-0 text-[#F59E0B] mt-0.5" />
              <div>
                <p className="font-mono text-[#F0F2F5]">AI evidence analysis is not connected.</p>
                <p className="mt-1 leading-relaxed">
                  Real-time image classification, anomaly detection, and automated OCR validation will
                  execute once the backend intelligence service is connected in a later phase.
                </p>
              </div>
            </div>
          </Card>

          {/* Timeline of activity */}
          <Card>
            <h3 className="font-display text-lg text-[#F0F2F5] border-b border-white/8 pb-3 mb-5">
              Timeline & Logs
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
        </div>

        {/* Side Panel for Actions */}
        <aside className="space-y-6">
          <Card>
            <h3 className="font-display text-base text-[#F0F2F5] mb-3">Case Actions</h3>
            {isClosed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#10B981] font-mono text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  Case closed
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  This case has been resolved and is closed. No further changes can be registered.
                </p>
                {complaint.resolution && (
                  <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-3 text-xs leading-relaxed text-[#94A3B8]">
                    {complaint.resolution.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 flex flex-col">
                <Button variant="primary" onClick={() => setConvertOpen(true)}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Convert to Inspection
                </Button>
                <Button variant="secondary" onClick={() => setInfoOpen(true)}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  Request More Info
                </Button>
                <Button variant="secondary" onClick={() => setResolveOpen(true)}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolve Case
                </Button>
                <Button variant="danger" onClick={() => setRejectOpen(true)}>
                  <XCircle className="h-3.5 w-3.5" />
                  Reject Case
                </Button>
              </div>
            )}
          </Card>

          {/* Traceability panel */}
          {complaint.linkedInspectionId && (
            <Card className="border-[#10B981]/35 bg-[#10B981]/5">
              <h3 className="font-display text-base text-[#10B981] flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5" />
                Linked Investigation
              </h3>
              <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
                This consumer case has been converted to an official metrology investigation.
              </p>
              <div className="mt-4 font-mono text-[0.66rem] text-[#CBD5E1]">
                <p>Inspection Reference:</p>
                <p className="text-[#F59E0B] mt-1 font-semibold">{complaint.linkedInspectionId}</p>
              </div>
              <div className="mt-4">
                <Link to={`/officer/inspections/${complaint.linkedInspectionDraftId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Inspection
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-display text-base text-[#F0F2F5] mb-2">Complainant privacy</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Complainant details are verified and masked. Name is displayed for identification,
              while further contacts are restricted to protect citizen reporter confidentiality.
            </p>
            <div className="mt-4 font-mono text-[0.66rem] text-[#CBD5E1] space-y-1">
              <p>Name: <span className="text-[#F0F2F5]">{complaint.complainantName}</span></p>
              <p>Phone: <span className="text-[#F59E0B]">{complaint.complainantPhone || "Hidden (Masked)"}</span></p>
              <p>Email: <span className="text-[#F59E0B]">{complaint.complainantEmail || "Hidden (Masked)"}</span></p>
            </div>
          </Card>
        </aside>
      </div>

      {/* ── Modals ── */}
      {/* Request info */}
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Request more information"
        description="Select the additional items needed and explain the reason. This will be visible to the consumer on tracking."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {Object.keys(selectedItems).map((key) => (
              <label key={key} className="flex items-center gap-2.5 font-mono text-[0.72rem] text-[#CBD5E1] select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems[key]}
                  onChange={() => setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="rounded border-white/12 bg-[#0B111C]"
                />
                {key}
              </label>
            ))}
          </div>
          <textarea
            value={infoReason}
            onChange={(e) => setInfoReason(e.target.value)}
            rows={4}
            placeholder="Explain what is needed..."
            className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none"
          />
          {formError && <DialogError message={formError} />}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setInfoOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={busy} onClick={handleRequestInfo}>
              Send Request
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Resolve case */}
      <Dialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve this complaint?"
        description="Explain the resolution outcome. The complainant will be notified."
      >
        <div className="space-y-4">
          <textarea
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            rows={4}
            placeholder="Describe the investigation results or corrective actions taken..."
            className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none"
          />
          {formError && <DialogError message={formError} />}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              loading={busy}
              disabled={!resolveNotes.trim()}
              onClick={handleResolve}
            >
              Resolve Case
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reject case */}
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this complaint?"
        description="Explain the reason for rejecting this report."
      >
        <div className="space-y-4">
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
            placeholder="Explain why this case is being rejected..."
            className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none"
          />
          {formError && <DialogError message={formError} />}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              loading={busy}
              disabled={!rejectNotes.trim()}
              onClick={handleReject}
            >
              Reject Case
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Convert to Inspection */}
      <Dialog
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        title="Convert complaint to investigation?"
        description="This will initialize an official metrology inspection draft pre-filled with all evidence images and product context from this consumer grievance."
      >
        <div className="space-y-4">
          {formError && <DialogError message={formError} />}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setConvertOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={busy} onClick={handleConvert}>
              Create inspection
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
