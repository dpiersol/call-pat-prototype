import { useEffect, useState } from "react";
import { attachmentUrl } from "../api";

/** Fetch blob URL for an attachment that requires Authorization. */
export function useBlobImage(
  token: string | null,
  attachmentId: string | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !attachmentId) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    void (async () => {
      const res = await fetch(attachmentUrl(attachmentId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      if (!cancelled) setUrl(objectUrl);
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, attachmentId]);

  return url;
}
