"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  async function handleDelete() {
    if (!confirm("Удалить этот товар?")) return;
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Товар удалён", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Не удалось удалить товар", variant: "error" });
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Удалить">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
