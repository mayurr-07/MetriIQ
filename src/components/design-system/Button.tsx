import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary — the one dominant action per view
   * secondary — solid, lower-emphasis alternative
   * outline / tertiary — quiet, supporting action (tertiary is an alias of outline)
   * ghost — lowest emphasis, used inline or in dense toolbars
   * danger / destructive — irreversible or high-consequence actions
   */
  variant?: "primary" | "secondary" | "outline" | "tertiary" | "ghost" | "danger" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  /** Shows a spinner and disables interaction without shifting layout. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-[0.16em]",
          "transition-[background-color,border-color,color,transform,opacity] duration-150 ease-out",
          "active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-45 disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-bd focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg",
          "cursor-pointer disabled:cursor-not-allowed",
          // sizes
          size === "sm" && "min-h-[36px] px-3 text-[0.68rem]",
          size === "md" && "min-h-[44px] px-5 text-[0.75rem]",
          size === "lg" && "min-h-[50px] px-7 text-[0.8rem]",
          size === "icon" && "h-10 w-10 p-0 text-[0.75rem]",
          // variants
          variant === "primary" &&
          "border border-app-accent-bd bg-app-accent-bg text-app-accent hover:border-app-accent-bd-h hover:bg-app-accent-bg-h",
          variant === "secondary" &&
          "border border-app-edge-mid bg-app-hover text-app-ink hover:border-app-edge-hi hover:bg-app-hover-hi",
          (variant === "outline" || variant === "tertiary") &&
          "border border-app-edge-mid bg-transparent text-app-ink-dim hover:border-app-edge-hi hover:text-app-ink",
          variant === "ghost" &&
          "border border-transparent bg-transparent text-app-ink-dim hover:bg-app-hover hover:text-app-ink",
          (variant === "danger" || variant === "destructive") &&
          "border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] hover:border-[#EF4444]/60 hover:bg-[#EF4444]/20",
          className,
        )}
        {...props}
      >
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
        {loading && (
          <span
            className="absolute inset-0 grid place-items-center"
            role="status"
            aria-label="Loading"
          >
            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current/30 border-t-current" />
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
