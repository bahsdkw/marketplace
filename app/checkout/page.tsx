"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import type { AddressInput } from "@/lib/validations";

type Address = AddressInput & { id: string };

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();
  const { lines, totalPrice } = useCartStore();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressInput>({
    fullName: "",
    line1: "",
    city: "",
    postal: "",
    country: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/checkout");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data: Address[]) => {
        setAddresses(data);
        if (data.length) setSelectedAddress(data[0].id);
        else setShowNewAddress(true);
      });
  }, []);

  async function saveAddress() {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    if (!res.ok) {
      toast({ title: "Проверьте поля адреса", variant: "error" });
      return null;
    }
    const addr = await res.json();
    setAddresses((prev) => [...prev, addr]);
    setSelectedAddress(addr.id);
    setShowNewAddress(false);
    return addr.id;
  }

  async function handlePay() {
    setLoading(true);
    let addressId = selectedAddress;

    if (showNewAddress || !addressId) {
      const id = await saveAddress();
      if (!id) {
        setLoading(false);
        return;
      }
      addressId = id;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        addressId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Ошибка оформления заказа", description: data.error, variant: "error" });
      return;
    }

    window.location.href = data.url;
  }

  if (lines.length === 0) {
    return <div className="container-page py-16 text-center text-muted-foreground">Корзина пуста</div>;
  }

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Оформление заказа</h1>

      <Card>
        <CardHeader>
          <CardTitle>Адрес доставки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length > 0 && !showNewAddress && (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[:checked]:border-primary"
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === a.id}
                    onChange={() => setSelectedAddress(a.id)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    {a.fullName}, {a.line1}, {a.city}, {a.postal}, {a.country}
                  </span>
                </label>
              ))}
              <Button variant="link" size="sm" onClick={() => setShowNewAddress(true)} className="px-0">
                + Добавить новый адрес
              </Button>
            </div>
          )}

          {showNewAddress && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Полное имя</Label>
                <Input value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Адрес</Label>
                <Input value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Город</Label>
                <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Индекс</Label>
                <Input value={newAddress.postal} onChange={(e) => setNewAddress({ ...newAddress, postal: e.target.value })} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Страна</Label>
                <Input value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Итого к оплате</CardTitle>
        </CardHeader>
        <CardContent>
          {lines.map((l) => (
            <div key={l.productId} className="flex justify-between py-1 text-sm">
              <span>{l.title} × {l.quantity}</span>
              <span>{formatPrice(l.price * l.quantity)}</span>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
            <span>Сумма</span>
            <span>{formatPrice(totalPrice())}</span>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="mt-6 w-full" onClick={handlePay} disabled={loading}>
        {loading ? "Переходим к оплате..." : "Оплатить через Stripe"}
      </Button>
    </div>
  );
}
