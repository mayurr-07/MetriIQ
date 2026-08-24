import type { ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Scale } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/types";
import { canAccessWorkspace, getDefaultRouteForRole, hasPermission, type Workspace } from "@/lib/rbac";
import { getRoleLabel } from "@/lib/roles";
import { ForbiddenState } from "@/components/design-system/States";
import { Button } from "@/components/design-system/Button";

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Top-level route group this subtree belongs to. */
  workspace: Workspace;
  requiredPermission?: Permission;
}

function ForbiddenScreen({ reason }: { reason: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080C14] text-[#F0F2F5]">
      <header className="border-b border-white/8 bg-[#080C14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 md:px-10">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55"
          >
            <Scale className="h-5 w-5 text-[#F59E0B]" />
            <span className="font-display text-lg text-[#F0F2F5]">Legal Metrology</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <ForbiddenState />
        <p className="mx-auto mt-4 max-w-md text-center text-[0.82rem] leading-relaxed text-[#64748B]">
          {reason}
        </p>
        {user && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(getDefaultRouteForRole(user.role))}
            >
              Go to {getRoleLabel(user.role)} workspace
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Switch account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Route guard.
 *
 * Frontend protection is a UX and navigation boundary only. A real backend
 * must independently enforce authorization on every request — this component
 * must never be treated as a security control on its own.
 */
export default function ProtectedRoute({
  children,
  workspace,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canAccessWorkspace(user.role, workspace)) {
    return (
      <ForbiddenScreen
        reason={`The ${getRoleLabel(user.role)} role does not have access to this workspace.`}
      />
    );
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return (
      <ForbiddenScreen
        reason={`This module requires the "${requiredPermission.replace(/_/g, " ")}" permission.`}
      />
    );
  }

  return <>{children}</>;
}
