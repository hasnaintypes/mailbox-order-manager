"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrderForm() {
  const router = useRouter();
  // One key per form instance: a double-submit or retry replays the same order.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setErrors([]);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        domain: form.get("domain"),
        provider: form.get("provider"),
        mailboxCount: form.get("mailboxCount"),
      }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const details = body?.error?.details ?? [];
      setErrors(
        details.length
          ? details.map((d: { path: string; message: string }) => d.message)
          : [body?.error?.message ?? "Could not create the order."],
      );
      setPending(false);
      return;
    }

    router.push(`/orders/${body.order.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input id="domain" name="domain" placeholder="example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <select
          id="provider"
          name="provider"
          defaultValue="google"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="google">Google</option>
          <option value="microsoft">Microsoft</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mailboxCount">Mailboxes (1–50)</Label>
        <Input id="mailboxCount" name="mailboxCount" type="number" min={1} max={50} defaultValue={1} required />
      </div>
      {errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertDescription>{errors.join(" ")}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create order"}</Button>
    </form>
  );
}
