"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";

type WishlistItem = {
  id: string;
  product: {
    id: string;
    slug: string;
    title: string;
    price: string;
    compareAtPrice: string | null;
    images: string[];
    ratingAvg: number;
    ratingCount: number;
    shop: { name: string };
  };
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Избранное</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Список избранного пуст.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                ...item.product,
                price: Number(item.product.price),
                compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
                shopName: item.product.shop.name,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
