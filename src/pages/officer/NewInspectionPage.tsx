import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { Dialog } from "@/components/design-system/Dialog";
import WorkflowProgress from "@/components/inspection/WorkflowProgress";
import DemoBanner from "@/components/inspection/DemoBanner";
import WorkflowStatusBadge from "@/components/inspection/WorkflowStatusBadge";
import { inspectionService } from "@/services/inspection/inspectionService";
import { StorageError } from "@/services/storage";
import { evidenceService } from "@/services/inspection/evidenceService";
import { qualityService } from "@/services/inspection/qualityService";
import { labelExtractionService } from "@/services/inspection/labelExtractionService";
import { complianceService } from "@/services/inspection/complianceService";
import { deriveWorkflowState, reviewsFromLabel } from "@/features/inspection/draftFactory";
import type { EvidenceKind, InspectionDraft, ProductContext } from "@/types/inspection";
import { INSPECTION_STEPS } from "@/types/inspection";

const CATEGORIES = ["Packaged food", "Edible oil", "Spices", "Beverages", "Other packaged commodity"];

function persist(draft: InspectionDraft): InspectionDraft {
  return inspectionService.save({ ...draft, workflowState: deriveWorkflowState(draft) });
}

export default function NewInspectionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const existingId = params.get("draft");
    const existing = existingId ? inspectionService.get(existingId) : null;
    setDraft(existing ?? inspectionService.create());
  }, [params]);

  /**
   * Applies a change and persists it.
   *
   * Persistence can genuinely fail (a full device quota after several
   * image-heavy drafts). The edit is still applied in memory so the officer
   * never loses what they typed, and a clear warning is surfaced.
   */
  const update = (next: InspectionDraft) => {
    try {
      setDraft(persist(next));
      setError(null);
    } catch (err) {
      setDraft({ ...next, workflowState: deriveWorkflowState(next) });
      console.error("Inspection draft could not be saved:", err);
      setError(
        err instanceof StorageError
          ? err.message
          : "This draft could not be saved to the device. Your changes are still on screen.",
      );
    }
  };

  const step = draft?.currentStep ?? 1;
  const canAdvance = useMemo(() => {
    if (!draft) return false;
    if (step === 1) return Boolean(draft.product.productName && draft.product.category && draft.product.location);
    if (step === 2) return draft.evidence.some((item) => item.kind === "FRONT");
    return true;
  }, [draft, step]);

  if (!draft) {
    return <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#94A3B8]">Preparing draft…</p>;
  }

  const goTo = (nextStep: number) => {
    update({ ...draft, currentStep: nextStep });
  };

  const saveAndExit = () => {
    try {
      persist(draft);
      navigate("/officer/inspections");
    } catch (err) {
      console.error("Inspection draft could not be saved:", err);
      setError(
        err instanceof StorageError
          ? err.message
          : "This draft could not be saved. Please free up space and try again.",
      );
    }
  };

  const onProduct = (key: keyof ProductContext, value: string) => {
    update({ ...draft, product: { ...draft.product, [key]: value } });
  };

  const addEvidence = async (kind: EvidenceKind, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    const item = await evidenceService.fromFile(file, kind);
    const evidence = [...draft.evidence.filter((entry) => entry.kind !== kind || kind === "ADDITIONAL"), item];
    update({ ...draft, evidence, quality: null, extractionStatus: "IDLE", complianceStatus: "IDLE" });
  };

  const removeEvidence = (id: string) => {
    const target = draft.evidence.find((item) => item.id === id);
    if (target) evidenceService.revoke(target);
    update({ ...draft, evidence: draft.evidence.filter((item) => item.id !== id) });
  };

  const runAnalysis = async (demo: boolean) => {
    setBusy(true);
    setError(null);
    try {
      setStage("Checking image readiness");
      const quality = await qualityService.analyse(draft.evidence.length, demo);
      setStage("Reading package text");
      const ocr = await labelExtractionService.extract(
        draft.evidence.map((item) => item.id),
        demo,
      );
      setStage("Preparing compliance checks");
      const compliance = await complianceService.evaluate(Boolean(ocr.label), demo);
      const extracted = ocr.label;
      update({
        ...draft,
        isDemo: demo || draft.isDemo,
        quality,
        extractionStatus: ocr.status,
        extractedLabel: extracted,
        fieldReviews: extracted ? reviewsFromLabel(extracted) : draft.fieldReviews,
        complianceStatus: compliance.status,
        complianceOutcome: compliance.outcome,
        checks: compliance.checks,
        violations: compliance.violations,
        currentStep: 3,
      });
    } catch {
      setError("Analysis could not be completed. Please try again.");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const submitDecision = () => {
    if (!draft.decision.decision) return;
    const submitted = persist({
      ...draft,
      decision: { ...draft.decision, submittedAt: new Date().toISOString() },
      currentStep: 6,
    });
    setDraft(submitted);
    setConfirmOpen(false);
  };

  return (
    <div>
      <PageHeader
        crumbs={["Inspection Officer", "New Inspection"]}
        title="New Inspection"
        description="A guided field workflow. AI is assistive and is not connected unless you run a labelled demo preview."
        action={
          <Button variant="outline" size="sm" onClick={saveAndExit}>
            Save draft
          </Button>
        }
      />

      <WorkflowProgress current={step} />

      {draft.isDemo && (
        <div className="mt-5">
          <DemoBanner />
        </div>
      )}

      <div className="mt-6">
        {step === 1 && <ProductStep product={draft.product} onChange={onProduct} />}
        {step === 2 && (
          <EvidenceStep
            draft={draft}
            onAdd={addEvidence}
            onRemove={removeEvidence}
          />
        )}
        {step === 3 && (
          <ExtractStep
            draft={draft}
            busy={busy}
            stage={stage}
            onAnalyse={runAnalysis}
            onChangeField={(key, value) =>
              update({
                ...draft,
                fieldReviews: draft.fieldReviews.map((field) =>
                  field.key === key ? { ...field, value, confirmed: false } : field,
                ),
              })
            }
            onConfirmField={(key) =>
              update({
                ...draft,
                fieldReviews: draft.fieldReviews.map((field) =>
                  field.key === key ? { ...field, confirmed: true } : field,
                ),
              })
            }
          />
        )}
        {step === 4 && <ComplianceStep draft={draft} onAnalyse={() => runAnalysis(draft.isDemo)} />}
        {step === 5 && <ReviewStep draft={draft} />}
        {step === 6 && (
          <SubmitStep
            draft={draft}
            onOpen={() => setConfirmOpen(true)}
            onDecision={(decision) => update({ ...draft, decision: { ...draft.decision, decision } })}
            onNotes={(notes) => update({ ...draft, decision: { ...draft.decision, notes } })}
          />
        )}
      </div>

      {error && <p className="mt-4 text-sm text-[#EF4444]">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
        <Button variant="ghost" disabled={step === 1} onClick={() => goTo(Math.max(1, step - 1))}>
          Back
        </Button>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#64748B]">
          Step {step} of {INSPECTION_STEPS.length} · {draft.reference}
        </p>
        {step < 6 ? (
          <Button variant="primary" disabled={!canAdvance || busy} onClick={() => goTo(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" disabled={!draft.decision.decision} onClick={() => setConfirmOpen(true)}>
            Review submission
          </Button>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit inspection?"
        description="This record will be saved locally on this device. It is not sent to a government backend."
      >
        <dl className="space-y-2 font-mono text-[0.72rem] text-[#94A3B8]">
          <div className="flex justify-between gap-4"><dt>Reference</dt><dd className="text-[#F0F2F5]">{draft.reference}</dd></div>
          <div className="flex justify-between gap-4"><dt>Product</dt><dd className="text-[#F0F2F5]">{draft.product.productName || "—"}</dd></div>
          <div className="flex justify-between gap-4"><dt>Evidence</dt><dd className="text-[#F0F2F5]">{draft.evidence.length}</dd></div>
          <div className="flex justify-between gap-4"><dt>Decision</dt><dd className="text-[#F0F2F5]">{draft.decision.decision ?? "Not selected"}</dd></div>
        </dl>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={submitDecision}>Save locally</Button>
        </div>
      </Dialog>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  hint,
}: {
  id: keyof ProductContext;
  label: string;
  value: string;
  onChange: (key: keyof ProductContext, value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
        {label} {required && <span className="text-[#F59E0B]">*</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
      />
      {hint && <span className="mt-1 block text-[0.72rem] text-[#64748B]">{hint}</span>}
    </label>
  );
}

function ProductStep({
  product,
  onChange,
}: {
  product: ProductContext;
  onChange: (key: keyof ProductContext, value: string) => void;
}) {
  return (
    <Card>
      <h2 className="font-display text-xl text-[#F0F2F5]">Product context</h2>
      <p className="mt-1 text-sm text-[#94A3B8]">Only the essentials needed to identify this inspection in the field.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
            Product category <span className="text-[#F59E0B]">*</span>
          </span>
          <select
            value={product.category}
            onChange={(e) => onChange("category", e.target.value)}
            className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <Field id="productType" label="Product type" value={product.productType} onChange={onChange} />
        <Field id="productName" label="Product name" value={product.productName} onChange={onChange} required />
        <Field id="brand" label="Brand / manufacturer" value={product.brand} onChange={onChange} />
        <Field id="location" label="Inspection location" value={product.location} onChange={onChange} required />
        <Field id="inspectionDate" label="Inspection date" value={product.inspectionDate} onChange={onChange} />
        <Field id="reference" label="Inspection reference" value={product.reference} onChange={onChange} hint="Generated locally. Not an official case number." />
        <Field id="batchNumber" label="Batch / lot (optional)" value={product.batchNumber} onChange={onChange} />
      </div>
    </Card>
  );
}

function EvidenceStep({
  draft,
  onAdd,
  onRemove,
}: {
  draft: InspectionDraft;
  onAdd: (kind: EvidenceKind, file: File | undefined) => Promise<void>;
  onRemove: (id: string) => void;
}) {
  const slots: Array<{ kind: EvidenceKind; title: string; hint: string }> = [
    { kind: "FRONT", title: "Front of package", hint: "Principal display panel. Keep the label fully visible." },
    { kind: "BACK", title: "Back of package", hint: "Use this for manufacturer or care details if they are on the reverse." },
    { kind: "ADDITIONAL", title: "Additional evidence", hint: "Optional close-up of a specific declaration." },
  ];

  const handle = (kind: EvidenceKind) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    void onAdd(kind, file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const images = draft.evidence.filter((item) => item.kind === slot.kind);
        return (
          <Card key={slot.kind}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-[#F0F2F5]">{slot.title}</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">{slot.hint}</p>
              </div>
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                <ImagePlus className="h-4 w-4" />
                Upload image
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handle(slot.kind)} />
              </label>
            </div>
            {images.length === 0 ? (
              <div className="mt-4 grid place-items-center border border-dashed border-white/10 py-10 text-center">
                <Camera className="h-6 w-6 text-[#F59E0B]" />
                <p className="mt-2 text-sm text-[#94A3B8]">No image selected.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {images.map((item) => (
                  <figure key={item.id} className="border border-white/10 bg-black/20">
                    <img src={item.previewUrl} alt={`${slot.title} preview`} className="h-48 w-full object-cover" />
                    <figcaption className="flex items-center justify-between px-3 py-2">
                      <span className="truncate font-mono text-[0.62rem] text-[#94A3B8]">{item.fileName}</span>
                      <button type="button" onClick={() => onRemove(item.id)} className="text-[#EF4444]" aria-label="Remove image">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function ExtractStep({
  draft,
  busy,
  stage,
  onAnalyse,
  onChangeField,
  onConfirmField,
}: {
  draft: InspectionDraft;
  busy: boolean;
  stage: string;
  onAnalyse: (demo: boolean) => Promise<void>;
  onChangeField: (key: InspectionDraft["fieldReviews"][number]["key"], value: string) => void;
  onConfirmField: (key: InspectionDraft["fieldReviews"][number]["key"]) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-xl text-[#F0F2F5]">Image quality</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
          {draft.quality?.message ?? "Image quality analysis will run when the inspection service is connected."}
        </p>
        {draft.quality && (
          <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">{draft.quality.status}</p>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl text-[#F0F2F5]">Label extraction</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
          OCR is not connected. You can wait for the service, enter values manually, or run a labelled demo preview.
        </p>
        {busy && (
          <div className="mt-4 border border-white/8 bg-white/[0.02] px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#F59E0B]">
            {stage || "Processing"}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" loading={busy} onClick={() => void onAnalyse(false)}>
            Request analysis
          </Button>
          <Button variant="outline" loading={busy} onClick={() => void onAnalyse(true)}>
            Run demo analysis
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl text-[#F0F2F5]">Extracted label information</h2>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Confirm or correct every field. AI extraction is assistive.
        </p>
        {draft.extractionStatus === "UNAVAILABLE" && (
          <p className="mt-3 text-sm text-[#F59E0B]">Analysis unavailable. Enter the declarations manually if needed.</p>
        )}
        <div className="mt-5 grid gap-4">
          {draft.fieldReviews.map((field) => (
            <div key={field.key} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <label>
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#94A3B8]">
                  {field.label}
                </span>
                <input
                  value={field.value}
                  onChange={(e) => onChangeField(field.key, e.target.value)}
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>
              <Button variant={field.confirmed ? "secondary" : "outline"} size="sm" onClick={() => onConfirmField(field.key)}>
                {field.confirmed ? "Confirmed" : "Confirm"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ComplianceStep({ draft, onAnalyse }: { draft: InspectionDraft; onAnalyse: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-[#F0F2F5]">Compliance check</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              {draft.complianceStatus === "UNAVAILABLE" || !draft.complianceOutcome
                ? "The rule engine is not connected. No official finding has been produced."
                : "Demo checks only. Review each item before making a decision."}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onAnalyse}>Refresh checks</Button>
        </div>
        {draft.complianceOutcome && (
          <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#F59E0B]">
            {draft.complianceOutcome.replace(/_/g, " ")}
          </p>
        )}
      </Card>
      {draft.checks.length === 0 ? (
        <Card>
          <p className="text-sm text-[#94A3B8]">No compliance results yet. Request analysis or continue to record an officer decision.</p>
        </Card>
      ) : (
        draft.checks.map((check) => (
          <Card key={check.id}>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#94A3B8]">{check.title}</p>
            <p className="mt-2 text-sm text-[#F0F2F5]">{check.requirement}</p>
            <p className="mt-2 text-sm text-[#94A3B8]">Detected: {check.detectedValue}</p>
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">
              {check.outcome.replace(/_/g, " ")}
            </p>
          </Card>
        ))
      )}
      {draft.violations.length > 0 && (
        <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/8 px-4 py-3">
          <p className="text-[0.8rem] leading-relaxed text-[#F0F2F5]/90">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#F59E0B]">
              Officer review required ·{" "}
            </span>
            The items below are AI-assisted findings, not confirmed contraventions. They become a
            determination only when you record a decision.
          </p>
        </div>
      )}
      {draft.violations.map((item) => (
        <Card key={item.id}>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#F59E0B]">
            Potential issue · {item.severity} · {item.ruleReference}
          </p>
          <h3 className="mt-2 font-display text-lg text-[#F0F2F5]">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{item.description}</p>
          <p className="mt-3 text-sm text-[#CBD5E1]">Detected: {item.detectedValue}</p>
          <p className="text-sm text-[#CBD5E1]">Expected: {item.expectedRequirement}</p>
        </Card>
      ))}
    </div>
  );
}

function ReviewStep({ draft }: { draft: InspectionDraft }) {
  const front = draft.evidence.find((item) => item.kind === "FRONT");
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <Card>
          <h2 className="font-display text-xl text-[#F0F2F5]">Product and evidence</h2>
          <p className="mt-2 text-sm text-[#94A3B8]">{draft.product.productName || "Untitled product"} · {draft.product.brand || "No brand"}</p>
          {front && <img src={front.previewUrl} alt="Front evidence" className="mt-4 max-h-72 w-full object-contain bg-black/30" />}
        </Card>
        <Card>
          <h2 className="font-display text-xl text-[#F0F2F5]">Confirmed declarations</h2>
          <dl className="mt-4 space-y-2">
            {draft.fieldReviews.filter((field) => field.value).map((field) => (
              <div key={field.key} className="flex justify-between gap-4 border-b border-white/6 py-2 text-sm">
                <dt className="text-[#94A3B8]">{field.label}</dt>
                <dd className="text-right text-[#F0F2F5]">{field.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
      <Card>
        <h2 className="font-display text-xl text-[#F0F2F5]">Summary</h2>
        <div className="mt-4 space-y-3 text-sm text-[#94A3B8]">
          <p>Reference: <span className="text-[#F0F2F5]">{draft.reference}</span></p>
          <p>Evidence files: <span className="text-[#F0F2F5]">{draft.evidence.length}</span></p>
          <WorkflowStatusBadge state={draft.workflowState} />
        </div>
      </Card>
    </div>
  );
}

function SubmitStep({
  draft,
  onOpen,
  onDecision,
  onNotes,
}: {
  draft: InspectionDraft;
  onOpen: () => void;
  onDecision: (decision: NonNullable<InspectionDraft["decision"]["decision"]>) => void;
  onNotes: (notes: string) => void;
}) {
  return (
    <Card>
      <h2 className="font-display text-xl text-[#F0F2F5]">Officer decision</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
        AI does not decide this inspection. Choose an outcome and add notes before saving the local record.
      </p>
      <div className="mt-5 space-y-3">
        {(["PASS", "FAIL", "REQUIRES_FURTHER_REVIEW", "INCONCLUSIVE"] as const).map((value) => (
          <label key={value} className="flex min-h-[44px] items-center gap-3 border border-white/10 px-3 py-2">
            <input
              type="radio"
              name="decision"
              checked={draft.decision.decision === value}
              onChange={() => onDecision(value)}
            />
            <span className="text-sm text-[#F0F2F5]">{value.replace(/_/g, " ")}</span>
          </label>
        ))}
        <textarea
          value={draft.decision.notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={4}
          placeholder="Officer notes"
          className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
        />
      </div>
      {draft.decision.submittedAt ? (
        <div className="mt-6 border border-[#10B981]/30 bg-[#10B981]/10 p-4">
          <p className="font-display text-lg text-[#F0F2F5]">Inspection saved locally</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Demo environment only. This record has not been submitted to a government backend.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <Button variant="primary" disabled={!draft.decision.decision} onClick={onOpen}>
            Submit inspection
          </Button>
        </div>
      )}
    </Card>
  );
}
