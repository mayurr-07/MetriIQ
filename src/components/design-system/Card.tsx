import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  /** Adds hover lift/border feedback for cards that act as navigation targets. */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = false, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass relative p-5 md:p-6",
          glow && "warm-glow",
          interactive &&
            "cursor-pointer transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn("font-display text-lg text-[#F0F2F5]", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("mt-1 text-[0.82rem] leading-relaxed text-[#94A3B8]", className)}>{children}</p>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mt-5 border-t border-white/8 pt-4", className)}>{children}</div>;
}
