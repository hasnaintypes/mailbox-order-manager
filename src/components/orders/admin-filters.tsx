"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUSES, PROVIDER_NAMES } from "@/domain/orders/status";
import { capitalize } from "@/lib/format";

const ALL = "all";
const STATUS_ITEMS = [{ value: ALL, label: "All statuses" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: capitalize(s.toLowerCase()) }))];
const PROVIDER_ITEMS = [{ value: ALL, label: "All providers" }, ...PROVIDER_NAMES.map((p) => ({ value: p, label: capitalize(p) }))];

export function AdminFilters({ status, provider }: { status?: string; provider?: string }) {
  const router = useRouter();

  function update(next: { status?: string; provider?: string }) {
    const merged = { status, provider, ...next };
    const query = new URLSearchParams();
    if (merged.status && merged.status !== ALL) query.set("status", merged.status);
    if (merged.provider && merged.provider !== ALL) query.set("provider", merged.provider);
    router.push(`/admin/orders${query.size ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status ?? ALL} onValueChange={(value) => update({ status: value ?? ALL })} items={STATUS_ITEMS}>
        <SelectTrigger className="w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
        <SelectContent>
          {STATUS_ITEMS.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={provider ?? ALL} onValueChange={(value) => update({ provider: value ?? ALL })} items={PROVIDER_ITEMS}>
        <SelectTrigger className="w-44" aria-label="Filter by provider"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PROVIDER_ITEMS.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {status || provider ? (
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")}>
          <XIcon /> Clear
        </Button>
      ) : null}
    </div>
  );
}
