/**
 * Single registry for every browser-storage key used by the platform.
 *
 * Keys were previously declared ad-hoc inside individual services, which made
 * it impossible to audit what the application persists or to clear it reliably.
 * All persistence now flows through this module.
 *
 * IMPORTANT: this is a DEVELOPMENT-ONLY persistence adapter. Nothing written
 * here reaches a government system. It exists so the prototype can demonstrate
 * an end-to-end workflow without a backend, and is the seam that a real API
 * client will replace.
 */
export const STORAGE_KEYS = {
  session: "lm_auth_user_session_v2",
  inspectionDrafts: "lm_inspection_drafts_v1",
  complaints: "lm_consumer_complaints_v1",
  contactRequests: "lm_contact_requests",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Raised when persistence fails, so callers can surface a useful message. */
export class StorageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

const available = (): boolean => typeof window !== "undefined" && "localStorage" in window;

/** Reads and parses a value, falling back when storage is empty or corrupt. */
export function readJson<T>(key: StorageKey, fallback: T): T {
  if (!available()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // Corrupt payload — do not crash the workspace over unreadable local data.
    return fallback;
  }
}

/**
 * Persists a value.
 *
 * Throws a `StorageError` on failure (most commonly a full quota after several
 * image-heavy drafts) so the calling screen can show a real message instead of
 * silently losing the officer's work.
 */
export function writeJson(key: StorageKey, value: unknown): void {
  if (!available()) {
    throw new StorageError("Local storage is unavailable in this browser.");
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (cause) {
    throw new StorageError(
      "This device's local storage is full. Remove an old draft and try again.",
      cause,
    );
  }
}

export function removeKey(key: StorageKey): void {
  if (!available()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing useful to do if removal fails */
  }
}

/** Clears every record the prototype has written. Used by the demo reset. */
export function clearAllPlatformData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => removeKey(key as StorageKey));
}
