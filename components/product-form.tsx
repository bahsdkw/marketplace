"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/image-uploader";
import { useToast } from "@/components/ui/toast";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  categoryId: string;
  images: string[];
};

export function ProductForm({ categories, initial }: { categories: Category[]; initial?: ProductFormValues }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(
    initial ?? { title: "", description: "", price: "", compareAtPrice: "", stock: "0", categoryId: "", images: [] }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      compareAtPrice: form.compareAtPrice || null,
      stock: form.stock,
      categoryId: form.categoryId,
      images: form.images,
    };

    const res = await fetch(form.id ? `/api/products/${form.id}` : "/api/products", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Ошибка сохранения", description: JSON.stringify(data.error), variant: "error" });
      return;
    }

    toast({ title: form.id ? "Товар обновлён" : "Товар отправлен на модерацию", variant: "success" });
    router.push("/seller/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Изображения</Label>
        <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
      </div>

      <div className="space-y-1.5">
        <Label>Название</Label>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label>Описание</Label>
        <Textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Цена ($)</Label>
          <Input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Старая цена ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.compareAtPrice}
            onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Остаток</Label>
          <Input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Категория</Label>
        <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Сохраняем..." : form.id ? "Сохранить изменения" : "Отправить на модерацию"}
      </Button>
    </form>
  );
}
