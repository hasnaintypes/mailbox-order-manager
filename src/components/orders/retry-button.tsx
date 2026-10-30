"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function RetryButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/orders/${orderId}/retry`, { method: "POST" });
    setPending(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error?.message ?? "Retry failed.");
      return;
    }

    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button size="sm" onClick={retry} disabled={pending}>
        {pending ? "Retrying…" : "Retry"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </span>
  );
}
