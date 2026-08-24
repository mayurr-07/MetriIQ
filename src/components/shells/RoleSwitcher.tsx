import { FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_DEFINITIONS, ROLE_ORDER } from "@/lib/roles";
import { getDefaultRouteForRole } from "@/lib/rbac";
import type { Role } from "@/types";

/**
 * Development-only workspace switcher.
 *
 * Shared by all application shells so role naming and navigation stay
 * configuration-driven and are never duplicated per shell. The flask icon
 * and "Dev" label keep it visually distinct from production controls.
 */
export default function RoleSwitcher({ fallback }: { fallback: Role }) {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <label className="hidden items-center gap-1.5 border border-white/12 bg-[#111827] px-2 py-1.5 text-[#94A3B8] transition focus-within:border-[#F59E0B]/50 lg:flex">
      <FlaskConical className="h-3 w-3 shrink-0 text-[#F59E0B]" aria-hidden="true" />
      <span className="sr-only">Development workspace switcher</span>
      <select
        aria-label="Switch workspace role (development only)"
        value={user?.role ?? fallback}
        onChange={(e) => {
          const next = e.target.value as Role;
          switchRole(next);
          navigate(getDefaultRouteForRole(next));
        }}
        className="cursor-pointer bg-transparent font-mono text-[0.62rem] text-[#F0F2F5] outline-none"
      >
        {ROLE_ORDER.map((role) => (
          <option key={role} value={role} className="bg-[#111827]">
            {ROLE_DEFINITIONS[role].label}
          </option>
        ))}
      </select>
    </label>
  );
}
