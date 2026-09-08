"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Category = { id: string; name: string; slug: string; productCount: number };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function addCategory() {
    if (name.trim().length < 2) return;
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);

    if (res.ok) {
      setName("");
      toast({ title: "Категория добавлена", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Ошибка добавления", variant: "error" });
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Удалить категорию?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Категория удалена", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Не удалось удалить (есть товары в категории)", variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input placeholder="Новая категория" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={addCategory} disabled={loading}>
          Добавить
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Название</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Товаров</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.productCount}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
