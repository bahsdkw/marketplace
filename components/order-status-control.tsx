"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: [],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export function OrderStatusControl({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const options = NEXT_STATUSES[currentStatus] ?? [];

  if (options.length === 0) return null;

  async function updateStatus(status: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast({ title: "Статус обновлён", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Не удалось обновить статус", variant: "error" });
    }
  }

  return (
    <Select onValueChange={updateStatus}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue placeholder="Изменить статус" />
      </SelectTrigger>
      <SelectContent>
        {options.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
