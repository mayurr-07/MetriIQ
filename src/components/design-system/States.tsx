import { AlertCircle, FileQuestion, Lock, RefreshCw, Search } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

const tile = "grid h-14 w-14 place-items-center border";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="state-enter flex flex-col items-center justify-center py-20 text-center">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border border-white/10" />
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-[#F59E0B]" />
      </div>
      <p className="mt-4 font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[#94A3B8]">
        {message}
      </p>
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There are no entries matching your current filters or search criteria.",
  action,
  icon,
  className,
}: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("state-enter flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className={cn(tile, "border-white/10 bg-white/[0.03] text-[#94A3B8]")}>
        {icon ?? <Search className="h-6 w-6 text-[#F59E0B]" />}
      </div>
      <h3 className="mt-4 font-display text-xl text-[#F0F2F5]">{title}</h3>
      <p className="mt-2 max-w-sm text-[0.88rem] leading-relaxed text-[#94A3B8]">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick} variant="secondary" size="sm">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "This request could not be completed. Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-enter flex flex-col items-center justify-center py-20 text-center">
      <div className={cn(tile, "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]")}>
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl text-[#F0F2F5]">{title}</h3>
      <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-[#94A3B8]">
        {message}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button onClick={onRetry} variant="primary" size="sm">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function ForbiddenState() {
  return (
    <div className="state-enter flex flex-col items-center justify-center py-24 text-center">
      <div className={cn(tile, "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]")}>
        <Lock className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl text-[#F0F2F5]">Restricted Workspace</h3>
      <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-[#94A3B8]">
        Your current role does not have access to this area. Switch to an authorized
        workspace or return to your own dashboard.
      </p>
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="state-enter flex flex-col items-center justify-center py-24 text-center">
      <div className={cn(tile, "border-white/10 bg-white/[0.03] text-[#94A3B8]")}>
        <FileQuestion className="h-6 w-6 text-[#F59E0B]" />
      </div>
      <h3 className="mt-4 font-display text-2xl text-[#F0F2F5]">Page not found</h3>
      <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-[#94A3B8]">
        The page you're looking for doesn't exist in this workspace.
      </p>
      <div className="mt-6">
        <Button onClick={() => window.location.assign("/")} variant="secondary" size="sm">
          Return to home
        </Button>
      </div>
    </div>
  );
}
