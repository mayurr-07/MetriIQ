import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { Dialog } from "@/components/design-system/Dialog";
import DemoBanner from "@/components/inspection/DemoBanner";
import WorkflowStatusBadge from "@/components/inspection/WorkflowStatusBadge";
import { inspectionService } from "@/services/inspection/inspectionService";
import { DECISION_LABEL } from "@/lib/inspectionStatus";
import { deriveWorkflowState } from "@/features/inspection/draftFactory";
import type { InspectionDecision, InspectionDraft } from "@/types/inspection";

export default function InspectionReviewPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(0);

  useEffect(() => {
    setDraft(inspectionService.get(id));
  }, [id]);

  if (!draft) {
    return (
      <Card>
        <p className="font-display text-xl text-[#F0F2F5]">Inspection not found</p>
        <p className="mt-2 text-sm text-[#94A3B8]">This draft is not stored on this device.</p>
        <Link to="/officer/inspections" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">Back to inspections</Button>
        </Link>
      </Card>
    );
  }

  const save = (next: InspectionDraft) => {
    setDraft(inspectionService.save({ ...next, workflowState: deriveWorkflowState(next) }));
  };

  const evidence = draft.evidence[activeEvidence];

  return (
    <div>
      <PageHeader
        crumbs={["Inspection Officer", "Inspection Case"]}
        title={draft.product.productName || "Inspection case"}
        description={`${draft.reference} · ${draft.product.location || "Location not set"}`}
        action={
          <Link to={`/officer/inspections/new?draft=${draft.id}`}>
            <Button variant="secondary" size="sm">Resume workflow</Button>
          </Link>
        }
      />

      {draft.isDemo && <div className="mb-5"><DemoBanner /></div>}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="font-display text-xl text-[#F0F2F5]">Captured evidence</h2>
            {draft.evidence.length === 0 ? (
              <p className="mt-3 text-sm text-[#94A3B8]">No images have been attached to this draft.</p>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {draft.evidence.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveEvidence(index)}
                      className={`min-h-[36px] border px-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${
                        index === activeEvidence ? "border-[#F59E0B]/40 text-[#F59E0B]" : "border-white/10 text-[#94A3B8]"
                      }`}
                    >
                      {item.kind}
                    </button>
                  ))}
                </div>
                {evidence && (
                  <img src={evidence.previewUrl} alt={`${evidence.kind} evidence`} className="mt-4 max-h-[28rem] w-full object-contain bg-black/30" />
                )}
              </>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-xl text-[#F0F2F5]">Extracted label data</h2>
            <dl className="mt-4 divide-y divide-white/6">
              {draft.fieldReviews.map((field) => (
                <div key={field.key} className="flex justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-[#94A3B8]">{field.label}</dt>
                  <dd className="text-right text-[#F0F2F5]">{field.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <h2 className="font-display text-xl text-[#F0F2F5]">Compliance findings</h2>
            {draft.checks.length === 0 ? (
              <p className="mt-3 text-sm text-[#94A3B8]">No compliance engine result is available for this draft.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {draft.checks.map((check) => (
                  <div key={check.id} className="border border-white/8 px-3 py-3">
                    <p className="text-sm text-[#F0F2F5]">{check.title}</p>
                    <p className="mt-1 text-[0.78rem] text-[#94A3B8]">{check.detectedValue}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">Inspection status</p>
            <div className="mt-3"><WorkflowStatusBadge state={draft.workflowState} /></div>
            <p className="mt-4 text-sm text-[#94A3B8]">Evidence files: {draft.evidence.length}</p>
          </Card>

          {draft.sourceComplaintId && (
            <Card className="border-[#10B981]/30">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#10B981]">
                Source complaint
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                This inspection was created from a consumer complaint.
              </p>
              <p className="mt-3 font-mono text-[0.8rem] text-[#F0F2F5]">{draft.sourceComplaintId}</p>
              {draft.sourceComplaintRecordId && (
                <Link
                  to={`/officer/complaints/${draft.sourceComplaintRecordId}`}
                  className="mt-4 inline-block"
                >
                  <Button variant="outline" size="sm">
                    View complaint
                  </Button>
                </Link>
              )}
            </Card>
          )}

          <Card>
            <h2 className="font-display text-xl text-[#F0F2F5]">Officer decision</h2>
            <div className="mt-4 space-y-2">
              {(Object.keys(DECISION_LABEL) as InspectionDecision[]).map((value) => (
                <label key={value} className="flex min-h-[44px] items-center gap-3 border border-white/10 px-3">
                  <input
                    type="radio"
                    name="review-decision"
                    checked={draft.decision.decision === value}
                    onChange={() => save({ ...draft, decision: { ...draft.decision, decision: value } })}
                  />
                  <span className="text-sm">{DECISION_LABEL[value]}</span>
                </label>
              ))}
            </div>
            <textarea
              value={draft.decision.notes}
              onChange={(e) => save({ ...draft, decision: { ...draft.decision, notes: e.target.value } })}
              rows={4}
              placeholder="Officer notes"
              className="mt-3 w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none"
            />
            {draft.decision.submittedAt ? (
              <p className="mt-4 text-sm text-[#10B981]">Saved locally on this device.</p>
            ) : (
              <Button className="mt-4 w-full" disabled={!draft.decision.decision} onClick={() => setConfirmOpen(true)}>
                Submit inspection
              </Button>
            )}
          </Card>
        </aside>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Save this decision locally?"
        description="The record stays on this browser. It is not an official government submission."
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              save({ ...draft, decision: { ...draft.decision, submittedAt: new Date().toISOString() } });
              setConfirmOpen(false);
              navigate("/officer/inspections");
            }}
          >
            Save locally
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
