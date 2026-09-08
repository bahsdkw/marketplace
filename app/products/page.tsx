import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = { title: "Каталог товаров" };

async function getProducts(searchParams: Record<string, string | undefined>) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const perPage = 12;

  const where: Record<string, unknown> = { status: "PUBLISHED" as const };
  if (searchParams.q) where.title = { contains: searchParams.q, mode: "insensitive" };
  if (searchParams.category) where.category = { slug: searchParams.category };
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      ...(searchParams.minPrice && { gte: Number(searchParams.minPrice) }),
      ...(searchParams.maxPrice && { lte: Number(searchParams.maxPrice) }),
    };
  }

  const orderBy =
    searchParams.sort === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price_desc"
        ? { price: "desc" as const }
        : searchParams.sort === "rating"
          ? { ratingAvg: "desc" as const }
          : { createdAt: "desc" as const };

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { shop: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany(),
  ]);

  return { items, total, totalPages: Math.ceil(total / perPage), page, categories };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { items, total, totalPages, page, categories } = await getProducts(searchParams);

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Каталог товаров {total > 0 && <span className="text-muted-foreground font-normal">({total})</span>}
      </h1>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <ProductFilters categories={categories} searchParams={searchParams} />

        <div>
          {items.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">Товары не найдены. Попробуйте изменить фильтры.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    price: Number(p.price),
                    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                    shopName: p.shop.name,
                  }}
                />
              ))}
            </div>
          )}
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
