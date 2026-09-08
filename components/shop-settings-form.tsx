"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type ShippingMethod = { name: string; price: number };

export function ShopSettingsForm({
  shop,
}: {
  shop: { name: string; description: string; shippingMethods: ShippingMethod[] };
}) {
  const [form, setForm] = useState(shop);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/shops/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    toast({ title: res.ok ? "Настройки сохранены" : "Ошибка сохранения", variant: res.ok ? "success" : "error" });
  }

  function updateMethod(i: number, field: keyof ShippingMethod, value: string) {
    const methods = [...form.shippingMethods];
    methods[i] = { ...methods[i], [field]: field === "price" ? Number(value) : value };
    setForm({ ...form, shippingMethods: methods });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label>Название магазина</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Описание</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Способы доставки</Label>
        {form.shippingMethods.map((m, i) => (
          <div key={i} className="flex gap-2">
            <Input value={m.name} onChange={(e) => updateMethod(i, "name", e.target.value)} placeholder="Название" />
            <Input
              type="number"
              value={m.price}
              onChange={(e) => updateMethod(i, "price", e.target.value)}
              placeholder="Цена"
              className="w-28"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setForm({ ...form, shippingMethods: [...form.shippingMethods, { name: "", price: 0 }] })}
        >
          + Добавить способ доставки
        </Button>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Сохраняем..." : "Сохранить"}
      </Button>
    </div>
  );
}
