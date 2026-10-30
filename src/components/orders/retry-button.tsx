"use client";

import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function RetryButton({ orderId, size = "sm" }: { orderId: string; size?: "sm" | "default" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function retry() {
    setPending(true);
    const response = await fetch(`/api/admin/orders/${orderId}/retry`, { method: "POST" }).catch(() => null);
    setPending(false);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      toast.error(body?.error?.message ?? "Retry failed.");
      return;
    }

    toast.success("Order queued for retry");
    router.refresh();
  }

  return (
    <Button size={size} variant="outline" onClick={retry} disabled={pending}>
      {pending ? <Loader2Icon className="animate-spin" /> : <RotateCcwIcon />}
      Retry
    </Button>
  );
}
