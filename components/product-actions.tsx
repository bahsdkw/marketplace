"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toast";

export function ProductActions({
  product,
}: {
  product: { id: string; title: string; price: number; image: string; stock: number; shopId: string; shopName: string };
}) {
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const { toast } = useToast();

  function handleAddToCart() {
    add({ productId: product.id, title: product.title, price: product.price, image: product.image, stock: product.stock, shopId: product.shopId, shopName: product.shopName }, qty);
    toast({ title: "Добавлено в корзину", description: product.title, variant: "success" });
  }

  async function handleWishlist() {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.status === 401) {
      toast({ title: "Войдите в аккаунт", description: "Чтобы добавить в избранное", variant: "error" });
      return;
    }
    const data = await res.json();
    toast({ title: data.added ? "Добавлено в избранное" : "Удалено из избранного", variant: "success" });
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-md border">
        <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Уменьшить">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center text-sm">{qty}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          aria-label="Увеличить"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button size="lg" disabled={product.stock === 0} onClick={handleAddToCart}>
        <ShoppingCart className="mr-2 h-4 w-4" /> В корзину
      </Button>

      <Button size="lg" variant="outline" onClick={handleWishlist} aria-label="В избранное">
        <Heart className="h-4 w-4" />
      </Button>
    </div>
  );
}
