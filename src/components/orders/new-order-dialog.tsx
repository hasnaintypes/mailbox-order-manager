"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { CreateOrderForm } from "@/components/orders/create-order-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function NewOrderDialog({ label = "New order" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New order</DialogTitle>
            <DialogDescription>
              The worker provisions the mailboxes in the background after you submit.
            </DialogDescription>
          </DialogHeader>
          <CreateOrderForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
