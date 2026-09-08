"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ShopModerationControl({ shopId, currentStatus }: { shopId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();

  async function setStatus(status: string) {
    const res = await fetch(`/api/admin/shops/${shopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({ title: "Статус магазина обновлён", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Ошибка", variant: "error" });
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {currentStatus !== "APPROVED" && (
        <Button size="sm" onClick={() => setStatus("APPROVED")}>
          Одобрить
        </Button>
      )}
      {currentStatus !== "SUSPENDED" && (
        <Button size="sm" variant="destructive" onClick={() => setStatus("SUSPENDED")}>
          Заблокировать
        </Button>
      )}
    </div>
  );
}
