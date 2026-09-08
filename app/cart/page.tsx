"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { lines, remove, setQuantity, totalPrice } = useCartStore();
  const router = useRouter();

  if (lines.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">Корзина пуста</h1>
        <p className="mt-2 text-muted-foreground">Добавьте товары из каталога, чтобы оформить заказ.</p>
        <Button className="mt-6" asChild>
          <Link href="/products">Перейти в каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Корзина</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {lines.map((line, i) => (
            <div
              key={line.productId}
              className="animate-rise-in flex gap-4 rounded-lg border bg-card p-4 transition-all duration-300 ease-soft hover:translate-x-1 hover:shadow-soft"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={line.image || "/placeholder.svg"} alt={line.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{line.shopName}</p>
                  <p className="font-medium">{line.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatPrice(line.price * line.quantity)}</span>
                    <button
                      onClick={() => remove(line.productId)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky top-20 h-fit rounded-lg border bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
          <h2 className="mb-4 font-heading text-lg font-semibold">Итого</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Товары</span>
            <span>{formatPrice(totalPrice())}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Доставка</span>
            <span>Рассчитывается при оформлении</span>
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
            <span>К оплате</span>
            <span>{formatPrice(totalPrice())}</span>
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={() => router.push("/checkout")}>
            Оформить заказ
          </Button>
        </div>
      </div>
    </div>
  );
}
