"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ProductModerationControl({ productId, currentStatus }: { productId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();

  async function setStatus(status: string) {
    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({ title: "Статус товара обновлён", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Ошибка", variant: "error" });
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {currentStatus !== "PUBLISHED" && (
        <Button size="sm" onClick={() => setStatus("PUBLISHED")}>
          Одобрить
        </Button>
      )}
      {currentStatus !== "REJECTED" && (
        <Button size="sm" variant="destructive" onClick={() => setStatus("REJECTED")}>
          Отклонить
        </Button>
      )}
    </div>
  );
}
