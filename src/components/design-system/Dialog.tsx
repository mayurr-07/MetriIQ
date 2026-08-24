import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Accessible modal primitive shared across the application.
 *
 * Handles backdrop click-to-close, Escape key, initial focus and a short,
 * purposeful entrance transition — the single implementation every future
 * dialog in the product should build on.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 h-full w-full cursor-default bg-[#080C14]/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            tabIndex={-1}
            className={cn(
              "glass relative z-10 w-full max-w-md p-6 outline-none",
              className,
            )}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="dialog-title" className="font-display text-xl text-[#F0F2F5]">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[#94A3B8]">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center border border-white/12 text-[#94A3B8] transition hover:border-white/25 hover:text-[#F0F2F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children && <div className="mt-5">{children}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
