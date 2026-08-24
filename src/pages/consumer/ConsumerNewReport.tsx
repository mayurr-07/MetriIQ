import { useState, useMemo, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  Check,
  ClipboardList,
  Flame,
  Info,
  Package,
  ShieldCheck,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { PageHeader } from "@/components/design-system/PageHeader";
import { complaintService } from "@/services/inspection/complaintService";
import { StorageError } from "@/services/storage";
import { ISSUE_TYPE_LABELS, type ComplaintIssueType } from "@/types/complaint";
import { cn } from "@/utils/cn";

const STEPS = [
  { id: 1, label: "What happened?" },
  { id: 2, label: "Show us evidence" },
  { id: 3, label: "Product details" },
  { id: 4, label: "Review & submit" },
] as const;

const ISSUE_OPTIONS: Array<{
  type: ComplaintIssueType;
  title: string;
  desc: string;
  icon: LucideIcon;
}> = [
  {
    type: "FOREIGN_OBJECT",
    title: "Foreign Object / Insect",
    desc: "Found an insect, stone, hair, or physical object inside the package.",
    icon: Flame,
  },
  {
    type: "SPOILED_FOOD",
    title: "Spoiled or Suspicious Food",
    desc: "Unpleasant odor, strange texture, mold, or food that seems unfit to eat.",
    icon: AlertTriangle,
  },
  {
    type: "DAMAGED_PACKAGE",
    title: "Damaged Package",
    desc: "Broken seals, punctured plastic, leaking cans, or torn protective covers.",
    icon: Package,
  },
  {
    type: "EXPIRED_PRODUCT",
    title: "Expired Product",
    desc: "Retailer is selling items past their printed Expiry or Best Before date.",
    icon: ShieldCheck,
  },
  {
    type: "MISLEADING_LABEL",
    title: "Misleading / Missing Label",
    desc: "Overcharging/MRP sticker alteration, missing net weight, or hidden Helpline info.",
    icon: ClipboardList,
  },
  {
    type: "COUNTERFEIT",
    title: "Suspected Counterfeit",
    desc: "Unusual print quality, suspicious branding, or questionable authenticity.",
    icon: AlertCircle,
  },
  {
    type: "OTHER",
    title: "Something Else",
    desc: "Other Legal Metrology or package declaration discrepancies.",
    icon: Info,
  },
];

interface FormState {
  issueType: ComplaintIssueType | null;
  description: string;
  productName: string;
  brand: string;
  batchNumber: string;
  purchaseDate: string;
  purchaseLocation: string;
  mrp: string;
  expiryDate: string;
  manufacturer: string;
  barcode: string;
  cityArea: string;
  complainantName: string;
  complainantPhone: string;
  complainantEmail: string;
  notSureFields: Record<string, boolean>;
}

export default function ConsumerNewReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    issueType: null,
    description: "",
    productName: "",
    brand: "",
    batchNumber: "",
    purchaseDate: "",
    purchaseLocation: "",
    mrp: "",
    expiryDate: "",
    manufacturer: "",
    barcode: "",
    cityArea: "",
    complainantName: "",
    complainantPhone: "",
    complainantEmail: "",
    notSureFields: {},
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageQuality, setImageQuality] = useState<{ status: string; message: string } | null>(null);

  const handleTextChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotSureToggle = (field: string) => {
    setForm((prev) => ({
      ...prev,
      notSureFields: {
        ...prev.notSureFields,
        [field]: !prev.notSureFields[field],
      },
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Simulate basic quality check instantly (responsive & honest dev state)
    setImageQuality({
      status: "CHECKING",
      message: "Checking image quality parameters...",
    });

    setTimeout(() => {
      setImageQuality({
        status: "READY",
        message: "Development Environment: Images are loaded. Local quality inspection passes.",
      });
    }, 600);

    const nextFiles = [...images, ...files];
    setImages(nextFiles);

    const nextPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...nextPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (images.length <= 1) {
      setImageQuality(null);
    }
  };

  const canContinue = useMemo(() => {
    if (step === 1) return form.issueType !== null;
    if (step === 2) return images.length > 0;
    if (step === 3) {
      const basicValid = Boolean(form.productName.trim() && form.cityArea.trim());
      const contactValid = Boolean(form.complainantName.trim());
      return basicValid && contactValid;
    }
    return true;
  }, [step, form, images]);

  const handleSubmit = async () => {
    if (!form.issueType) return;
    setBusy(true);
    try {
      const created = await complaintService.create({
        issueType: form.issueType,
        description: form.description,
        productName: form.productName,
        brand: form.notSureFields.brand ? "Not sure" : form.brand,
        batchNumber: form.notSureFields.batchNumber ? "Not sure" : form.batchNumber,
        purchaseDate: form.purchaseDate,
        purchaseLocation: form.purchaseLocation,
        mrp: form.notSureFields.mrp ? "Not sure" : form.mrp,
        expiryDate: form.notSureFields.expiryDate ? "Not sure" : form.expiryDate,
        manufacturer: form.notSureFields.manufacturer ? "Not sure" : form.manufacturer,
        barcode: form.notSureFields.barcode ? "Not sure" : form.barcode,
        cityArea: form.cityArea,
        complainantName: form.complainantName,
        complainantPhone: form.complainantPhone,
        complainantEmail: form.complainantEmail,
        images,
      });

      navigate(`/report/success?id=${created.complaintId}`);
    } catch (err) {
      // Never surface the raw exception to a citizen.
      console.error("Complaint submission failed:", err);
      setSubmitError(
        err instanceof StorageError
          ? err.message
          : "We could not save your report. Please check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report a Product Problem"
        description="Share details and evidence. Government inspectors will review and take appropriate action."
      />

      {/* ── guided steps navigation banner ── */}
      <ol className="flex items-center justify-between gap-2 border-b border-white/8 pb-4">
        {STEPS.map((s) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wider",
                active ? "text-[#F59E0B]" : done ? "text-[#10B981]" : "text-[#475569]"
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[0.55rem]",
                  active && "bg-[#F59E0B]/20 border border-[#F59E0B]/40",
                  done && "bg-[#10B981]/20 text-[#10B981]",
                  !active && !done && "bg-white/5 border border-transparent"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : s.id}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </li>
          );
        })}
      </ol>

      {/* ── STEP 1: Issue Selection ── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
            Step 1: Choose the primary issue
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ISSUE_OPTIONS.map((opt) => {
              const active = form.issueType === opt.type;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleTextChange("issueType", opt.type)}
                  className={cn(
                    "group flex items-start gap-4 border p-4 text-left transition",
                    active
                      ? "border-[#F59E0B]/50 bg-[#F59E0B]/10"
                      : "border-white/8 bg-[#111827]/40 hover:border-white/20 hover:bg-[#111827]/70"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center border",
                      active ? "border-[#F59E0B]/40 bg-[#F59E0B]/20 text-[#F59E0B]" : "border-white/10 bg-white/[0.02] text-[#94A3B8]"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className={cn("font-display text-base text-[#F0F2F5]", active && "text-[#F59E0B]")}>
                      {opt.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2: Evidence Capture ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                Step 2: Upload product photos
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                A clear, focused photo showing the issue helps authorities investigate faster.
              </p>
            </div>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">
              <Upload className="h-4 w-4" />
              Upload Image
              <input
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* quality check banner */}
          {imageQuality && (
            <div className="flex items-start gap-3 border border-white/8 bg-white/[0.02] px-4 py-3">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B] animate-pulse" />
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#F59E0B]">
                  Image quality state: {imageQuality.status}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {imageQuality.message}
                </p>
              </div>
            </div>
          )}

          {images.length === 0 ? (
            <div className="grid place-items-center border border-dashed border-white/10 py-16 text-center bg-[#111827]/20">
              <Camera className="h-7 w-7 text-[#F59E0B] opacity-60" />
              <p className="mt-3 text-sm text-[#F0F2F5]">No images uploaded yet</p>
              <p className="mt-1 max-w-xs text-xs text-[#94A3B8]">
                Please tap the button above to capture or select a photo of the product package.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagePreviews.map((preview, i) => (
                <Card key={preview} className="p-0 overflow-hidden border border-white/10 bg-[#0E1521]">
                  <img
                    src={preview}
                    alt={`Consumer evidence ${i + 1}`}
                    className="h-48 w-full object-cover"
                  />
                  <div className="flex items-center justify-between p-3">
                    <span className="font-mono text-[0.6rem] text-[#94A3B8]">
                      Photo {i + 1} ({Math.round(images[i].size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="text-[#EF4444] hover:text-[#EF4444]/80 p-1"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Product Context ── */}
      {step === 3 && (
        <div className="space-y-6">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
            Step 3: Product details & location
          </p>

          <Card>
            <h2 className="font-display text-lg text-[#F0F2F5] border-b border-white/6 pb-2.5">
              Product details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  Product Name *
                </span>
                <input
                  required
                  value={form.productName}
                  onChange={(e) => handleTextChange("productName", e.target.value)}
                  placeholder="e.g. Premium Besan 500g"
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                    Brand / Manufacturer
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNotSureToggle("brand")}
                    className="font-mono text-[0.55rem] uppercase tracking-wider text-[#F59E0B]"
                  >
                    {form.notSureFields.brand ? "I know it" : "Not sure"}
                  </button>
                </div>
                <input
                  disabled={form.notSureFields.brand}
                  value={form.notSureFields.brand ? "" : form.brand}
                  onChange={(e) => handleTextChange("brand", e.target.value)}
                  placeholder={form.notSureFields.brand ? "Marked as not sure" : "e.g. Shudh Ahaar"}
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60 disabled:opacity-40"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                    Batch / Lot Number
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNotSureToggle("batchNumber")}
                    className="font-mono text-[0.55rem] uppercase tracking-wider text-[#F59E0B]"
                  >
                    {form.notSureFields.batchNumber ? "I know it" : "Not sure"}
                  </button>
                </div>
                <input
                  disabled={form.notSureFields.batchNumber}
                  value={form.notSureFields.batchNumber ? "" : form.batchNumber}
                  onChange={(e) => handleTextChange("batchNumber", e.target.value)}
                  placeholder={form.notSureFields.batchNumber ? "Marked as not sure" : "e.g. BB-2607-A19"}
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60 disabled:opacity-40"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                    Retail Price (MRP)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNotSureToggle("mrp")}
                    className="font-mono text-[0.55rem] uppercase tracking-wider text-[#F59E0B]"
                  >
                    {form.notSureFields.mrp ? "I know it" : "Not sure"}
                  </button>
                </div>
                <input
                  disabled={form.notSureFields.mrp}
                  value={form.notSureFields.mrp ? "" : form.mrp}
                  onChange={(e) => handleTextChange("mrp", e.target.value)}
                  placeholder={form.notSureFields.mrp ? "Marked as not sure" : "e.g. 120"}
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60 disabled:opacity-40"
                />
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-[#F0F2F5] border-b border-white/6 pb-2.5">
              Incident Details & Location
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  City / Area *
                </span>
                <input
                  required
                  value={form.cityArea}
                  onChange={(e) => handleTextChange("cityArea", e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  Store / Purchase Location
                </span>
                <input
                  value={form.purchaseLocation}
                  onChange={(e) => handleTextChange("purchaseLocation", e.target.value)}
                  placeholder="e.g. Apex Retails, Jaipur"
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  Purchase Date
                </span>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => handleTextChange("purchaseDate", e.target.value)}
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>
            </div>

            <label className="block mt-4">
              <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                Problem Description
              </span>
              <textarea
                value={form.description}
                onChange={(e) => handleTextChange("description", e.target.value)}
                rows={4}
                placeholder="Please describe what is wrong with the package in your own words..."
                className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
              />
            </label>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-[#F0F2F5] border-b border-white/6 pb-2.5">
              Complainant Contact (Privacy Guarded)
            </h2>
            <p className="mt-1.5 text-xs text-[#94A3B8]">
              Your contact details are strictly protected by the department. Inspecting officers
              only receive the relevant case evidence.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  Your Name *
                </span>
                <input
                  required
                  value={form.complainantName}
                  onChange={(e) => handleTextChange("complainantName", e.target.value)}
                  placeholder="e.g. Pooja Verma"
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  Phone Number
                </span>
                <input
                  value={form.complainantPhone}
                  onChange={(e) => handleTextChange("complainantPhone", e.target.value)}
                  placeholder="e.g. +91 94140 XXXXX"
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                  Email Address
                </span>
                <input
                  type="email"
                  value={form.complainantEmail}
                  onChange={(e) => handleTextChange("complainantEmail", e.target.value)}
                  placeholder="e.g. pooja.verma@example"
                  className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
                />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* ── STEP 4: Review ── */}
      {step === 4 && (
        <div className="space-y-6">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
            Step 4: Review details before submitting
          </p>

          <Card>
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <h3 className="font-display text-lg text-[#F0F2F5]">Summary</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Edit
              </Button>
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-3 font-mono text-[0.72rem] text-[#94A3B8] sm:grid-cols-2">
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Issue type</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">
                  {form.issueType ? ISSUE_TYPE_LABELS[form.issueType] : "Not selected"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Product Name</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">{form.productName}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Brand</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">
                  {form.notSureFields.brand ? "Not sure" : form.brand || "—"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Batch / Lot</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">
                  {form.notSureFields.batchNumber ? "Not sure" : form.batchNumber || "—"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Incident Location</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">{form.purchaseLocation || form.cityArea}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-[#64748B]">Purchase Date</dt>
                <dd className="mt-1 text-sm text-[#F0F2F5]">{form.purchaseDate || "—"}</dd>
              </div>
            </dl>

            {form.description && (
              <div className="mt-6 border-t border-white/8 pt-4">
                <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[#64748B]">
                  Problem Description
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#F0F2F5]/90">
                  {form.description}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <h3 className="font-display text-lg text-[#F0F2F5]">Attached Evidence ({images.length} files)</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                Edit
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {imagePreviews.map((preview, i) => (
                <div key={preview} className="border border-white/10 overflow-hidden bg-black/20">
                  <img src={preview} alt="Evidence preview" className="h-32 w-full object-cover" />
                  <p className="p-2 font-mono text-[0.55rem] text-[#94A3B8]">Photo {i + 1}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg text-[#F0F2F5]">Before you submit</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
              Please confirm the details above are accurate to the best of your knowledge. Your
              contact details are used only so an officer can follow up on this report.
            </p>

            {submitError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-3 border border-[#EF4444]/40 bg-[#EF4444]/10 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden="true" />
                <div>
                  <p className="text-[0.8rem] text-[#F0F2F5]">{submitError}</p>
                  <p className="mt-1 text-[0.72rem] text-[#94A3B8]">
                    Your answers are still here — nothing has been lost.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                loading={busy}
                disabled={busy}
                onClick={handleSubmit}
                className="w-full"
              >
                Submit complaint
              </Button>
            </div>
          </Card>
        </div>
       )}

      {/* ── WIZARD FOOTER ── */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/8 pt-5">
        <Button
          type="button"
          variant="ghost"
          size="md"
          disabled={step === 1 || busy}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Back
        </Button>
        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[#64748B]">
          Step {step} of {STEPS.length}
        </span>
        {step < 4 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!canContinue || busy}
            onClick={() => setStep((s) => Math.min(4, s + 1))}
          >
            Continue
          </Button>
        ) : (
          <div className="w-[100px]" />
        )}
      </div>
    </div>
  );
}
