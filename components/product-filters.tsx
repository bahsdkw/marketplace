"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };

export function ProductFilters({
  categories,
  searchParams,
}: {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPrice() {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Сортировка</h3>
        <Select defaultValue={searchParams.sort ?? "newest"} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Сначала новые</SelectItem>
            <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
            <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
            <SelectItem value="rating">По рейтингу</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Категории</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", null)}
            className={cn(
              "block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted cursor-pointer",
              !searchParams.category && "bg-muted font-medium text-primary"
            )}
          >
            Все категории
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam("category", c.slug)}
              className={cn(
                "block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted cursor-pointer",
                searchParams.category === c.slug && "bg-muted font-medium text-primary"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Цена</h3>
        <div className="flex items-center gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">От</Label>
            <Input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">До</Label>
            <Input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-9" />
          </div>
        </div>
        <Button size="sm" variant="outline" className="mt-3 w-full" onClick={applyPrice}>
          Применить
        </Button>
      </div>
    </aside>
  );
}
