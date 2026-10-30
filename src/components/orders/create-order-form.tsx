"use client";

import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROVIDERS = [
  { value: "google", label: "Google Workspace" },
  { value: "microsoft", label: "Microsoft 365" },
];

export function CreateOrderForm() {
  const router = useRouter();
  // One key per form instance: a double-submit or retry replays the same order.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [provider, setProvider] = useState("google");
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
        provider,
        mailboxCount: form.get("mailboxCount"),
      }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);

    if (!response?.ok) {
      const details: { message: string }[] = body?.error?.details ?? [];
      const messages = details.length
        ? details.map((d) => d.message)
        : [body?.error?.message ?? "Could not create the order."];
      setErrors(messages);
      toast.error("Order was not created");
      setPending(false);
      return;
    }

    toast.success(response.status === 200 ? "Existing order opened" : "Order created");
    router.push(`/orders/${body.order.id}`);
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
          <CardDescription>The worker provisions mailboxes in the background after you submit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" name="domain" placeholder="example.com" autoComplete="off" required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={(value) => value && setProvider(value)} items={PROVIDERS}>
                <SelectTrigger id="provider" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailboxCount">Mailboxes (1–50)</Label>
              <Input id="mailboxCount" name="mailboxCount" type="number" min={1} max={50} defaultValue={1} required />
            </div>
          </div>
          {errors.length > 0 ? (
            <Alert variant="destructive">
              <AlertDescription>{errors.join(" ")}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Link href="/orders" className={buttonVariants({ variant: "ghost" })}>Cancel</Link>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            {pending ? "Creating…" : "Create order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
