import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

type FormState = {
  fullName: string;
  designation: string;
  department: string;
  email: string;
  district: string;
  message: string;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const EMPTY: FormState = {
  fullName: "",
  designation: "",
  department: "",
  email: "",
  district: "",
  message: "",
};

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [reference, setReference] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.department) return;
    setStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const generatedId = Math.floor(Math.random() * 8999) + 1000;
    setReference(generatedId);
    setStatus("done");
    setForm(EMPTY);
  };

  const field =
    "w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-[0.72rem] text-[#F0F2F5] outline-none transition focus:border-[#F59E0B]/60";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-[#080C14]/85 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Request department access"
            className="glass relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto border-t border-[#F59E0B]/25 p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Official correspondence</p>
                <h3 className="mt-2 font-display text-[1.6rem] leading-tight text-[#F0F2F5]">
                  Request department access
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-11 w-11 place-items-center border border-white/12 text-[#94A3B8] transition hover:border-white/30 hover:text-[#F0F2F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rule-line my-5" />

            {status === "done" ? (
              <div className="flex items-start gap-3 border border-[#10B981]/35 bg-[#10B981]/8 px-4 py-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                <div>
                  <p className="text-[0.92rem] text-[#F0F2F5]">Request logged with the department.</p>
                  <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Reference LM-REQ-{String(reference).padStart(4, "0")} · response within 3 working
                    days
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                      Full name *
                    </span>
                    <input className={field} value={form.fullName} onChange={update("fullName")} required />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                      Designation
                    </span>
                    <input className={field} value={form.designation} onChange={update("designation")} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                      Department *
                    </span>
                    <input className={field} value={form.department} onChange={update("department")} required />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                      District
                    </span>
                    <input className={field} value={form.district} onChange={update("district")} />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Official email *
                  </span>
                  <input type="email" className={field} value={form.email} onChange={update("email")} required />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Requirement
                  </span>
                  <textarea rows={3} className={field} value={form.message} onChange={update("message")} />
                </label>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#F59E0B]/45 bg-[#F59E0B]/10 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#F59E0B] transition hover:bg-[#F59E0B]/20 disabled:opacity-60"
                >
                  {status === "sending" ? "Transmitting…" : "Submit request"}
                </button>
                <p className="font-mono text-[0.58rem] leading-relaxed text-[#64748B]">
                  Records handled under the Legal Metrology (Packaged Commodities) Rules, 2011.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
