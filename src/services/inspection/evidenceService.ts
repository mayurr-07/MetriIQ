import type { EvidenceItem, EvidenceKind } from "@/types/inspection";
import { apiClient } from "@/lib/apiClient";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const evidenceService = {
  async fromFile(file: File, kind: EvidenceKind): Promise<EvidenceItem> {
    const previewUrl = URL.createObjectURL(file);
    const base: EvidenceItem = {
      id: uid("evd"),
      kind,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      previewUrl,
      capturedAt: new Date().toISOString(),
    };

    // Upload to MinIO via the backend. Silently skip if backend is unreachable.
    try {
      const uploaded = await apiClient.uploadImages([file]);
      if (uploaded[0]) {
        base.backendUrl = uploaded[0].url;
        base.fileKey = uploaded[0].fileKey;
      }
    } catch {
      // Backend not running — proceed in offline/demo mode.
    }

    return base;
  },

  revoke(item: EvidenceItem): void {
    if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
  },
};
