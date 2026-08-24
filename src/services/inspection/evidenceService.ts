import type { EvidenceItem, EvidenceKind } from "@/types/inspection";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const evidenceService = {
  async fromFile(file: File, kind: EvidenceKind): Promise<EvidenceItem> {
    const previewUrl = URL.createObjectURL(file);
    return {
      id: uid("evd"),
      kind,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      previewUrl,
      capturedAt: new Date().toISOString(),
    };
  },
  revoke(item: EvidenceItem): void {
    if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
  },
};
