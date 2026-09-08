import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

async function getHomeData() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { ratingAvg: "desc" },
      take: 8,
      include: { shop: { select: { name: true } } },
    }),
    prisma.category.findMany({ take: 6 }),
  ]);
  return { featured, categories };
}

export default async function HomePage() {
  const { featured, categories } = await getHomeData();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="blob h-[420px] w-[420px] -left-20 -top-32 bg-primary animate-blob-move" />
        <div className="blob h-[360px] w-[360px] -right-24 top-24 bg-accent animate-blob-move [animation-direction:reverse]" />
        <div className="container-page relative grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-rise-in">
            <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
              Покупайте у независимых продавцов <span className="text-primary">в одном месте</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Тысячи товаров, честные цены и быстрая доставка. Продавайте свои товары — открыть магазин можно за пару минут.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/products">
                  Смотреть каталог <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/seller/onboarding">Стать продавцом</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(0, 4).map((p, i) => (
              <div key={p.id} className="animate-rise-in" style={{ animationDelay: `${i * 90}ms` }}>
                <ProductCard
                  product={{ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, shopName: p.shop.name }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-all duration-300 ease-soft hover:-translate-y-1.5 hover:shadow-soft">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Быстрая доставка</p>
              <p className="text-sm text-muted-foreground">От 2 дней по всей стране</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-all duration-300 ease-soft hover:-translate-y-1.5 hover:shadow-soft">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Безопасная оплата</p>
              <p className="text-sm text-muted-foreground">Защита через Stripe</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-all duration-300 ease-soft hover:-translate-y-1.5 hover:shadow-soft">
            <RotateCcw className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Лёгкий возврат</p>
              <p className="text-sm text-muted-foreground">14 дней на возврат товара</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <h2 className="mb-6 font-heading text-2xl font-semibold">Категории</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="animate-rise-in rounded-lg border bg-card p-4 text-center text-sm font-medium transition-all duration-300 ease-soft hover:-translate-y-1.5 hover:border-primary hover:text-primary hover:shadow-soft-lg"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold">Популярные товары</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            Смотреть все
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {featured.map((p, i) => (
            <div key={p.id} className="animate-rise-in" style={{ animationDelay: `${i * 90}ms` }}>
              <ProductCard
                product={{ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, shopName: p.shop.name }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
