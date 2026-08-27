import type { User, Role } from "@/types";
import { STORAGE_KEYS, readJson, removeKey, writeJson } from "@/services/storage";
import { ROLE_DEFINITIONS } from "@/lib/roles";
import { apiClient, storeToken, clearToken } from "@/lib/apiClient";

const BACKEND_TO_ROLE: Record<string, Role> = {
  officer: "INSPECTION_OFFICER",
  admin: "ADMIN",
  senior: "SENIOR_OFFICER",
  consumer: "CONSUMER",
};

interface BackendLoginResponse {
  token: string;
  user: { _id: string; name: string; email: string; role: string; designation?: string; district?: string; badgeNumber?: string };
}

export interface LoginCredentials {
  email?: string;
  password?: string;
  role?: Role;
}

/**
 * DEVELOPMENT-ONLY demo identities.
 *
 * These are NOT real government personnel. Each identity is derived from its
 * role definition and clearly labelled as a demo account so no fictional
 * official is ever implied. This adapter is isolated from the future
 * production authentication implementation.
 */
function buildDemoUser(role: Role): User {
  const definition = ROLE_DEFINITIONS[role];
  return {
    id: `demo-${role.toLowerCase().replace(/_/g, "-")}`,
    // Role title is used as the identity — no fictional person name.
    name: definition.label,
    email: definition.demoEmail,
    role,
    designation: definition.description,
    department: "Demo Access — Development Environment",
    district: role === "CONSUMER" ? undefined : "Demo Jurisdiction",
    badgeNumber: role === "CONSUMER" ? undefined : "DEMO-ACCOUNT",
  };
}

export const DEMO_USERS: Record<Role, { user: User; pass: string }> = {
  INSPECTION_OFFICER: {
    user: buildDemoUser("INSPECTION_OFFICER"),
    pass: ROLE_DEFINITIONS.INSPECTION_OFFICER.demoPassword,
  },
  ADMIN: {
    user: buildDemoUser("ADMIN"),
    pass: ROLE_DEFINITIONS.ADMIN.demoPassword,
  },
  SENIOR_OFFICER: {
    user: buildDemoUser("SENIOR_OFFICER"),
    pass: ROLE_DEFINITIONS.SENIOR_OFFICER.demoPassword,
  },
  CONSUMER: {
    user: buildDemoUser("CONSUMER"),
    pass: ROLE_DEFINITIONS.CONSUMER.demoPassword,
  },
};

export const authService = {
  getCurrentUser(): User | null {
    return readJson<User | null>(STORAGE_KEYS.session, null);
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      try {
        writeJson(STORAGE_KEYS.session, user);
      } catch {
        // A failed session write must not block sign-in; the user simply will
        // not stay signed in across a refresh.
      }
    } else {
      removeKey(STORAGE_KEYS.session);
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    // Development quick access — role selected directly (no backend needed).
    if (credentials.role && DEMO_USERS[credentials.role]) {
      const user = DEMO_USERS[credentials.role].user;
      this.setCurrentUser(user);
      return user;
    }

    // Try real backend first when email + password are provided.
    if (credentials.email && credentials.password) {
      try {
        const resp = await apiClient.post<BackendLoginResponse>("/api/auth/login", {
          email: credentials.email.trim(),
          password: credentials.password,
        });
        storeToken(resp.token);
        const role: Role = BACKEND_TO_ROLE[resp.user.role] ?? "INSPECTION_OFFICER";
        const user: User = {
          id: resp.user._id,
          name: resp.user.name,
          email: resp.user.email,
          role,
          designation: resp.user.designation ?? "",
          department: "Government of India — Legal Metrology",
          district: resp.user.district,
          badgeNumber: resp.user.badgeNumber,
        };
        this.setCurrentUser(user);
        return user;
      } catch {
        // Backend unreachable — fall through to demo credentials check.
      }
    }

    if (credentials.email) {
      const cleanEmail = credentials.email.trim().toLowerCase();
      const match = Object.values(DEMO_USERS).find(
        (entry) => entry.user.email.toLowerCase() === cleanEmail,
      );

      if (match) {
        if (credentials.password && credentials.password !== match.pass) {
          throw new Error("Invalid password for this demo account.");
        }
        this.setCurrentUser(match.user);
        return match.user;
      }

      throw new Error(
        "Unrecognised account. Use a listed demo account or the development access options.",
      );
    }

    throw new Error("Please enter an email address to continue.");
  },

  logout(): void {
    clearToken();
    this.setCurrentUser(null);
  },
};
