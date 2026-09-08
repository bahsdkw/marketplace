import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

async function getShop(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      products: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const shop = await getShop(params.slug);
  if (!shop) return {};
  return { title: shop.name, description: shop.description ?? undefined };
}

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug);
  if (!shop || shop.status !== "APPROVED") notFound();

  return (
    <div>
      <div className="relative h-48 w-full bg-muted">
        {shop.banner && <Image src={shop.banner} alt="" fill className="object-cover" />}
      </div>
      <div className="container-page -mt-10 pb-8">
        <div className="flex items-end gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-muted">
            {shop.logo && <Image src={shop.logo} alt={shop.name} fill className="object-cover" />}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">{shop.name}</h1>
            {shop.description && <p className="text-sm text-muted-foreground">{shop.description}</p>}
          </div>
        </div>

        <h2 className="mb-4 mt-8 font-heading text-xl font-semibold">
          Товары магазина ({shop.products.length})
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shop.products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                price: Number(p.price),
                compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                shopName: shop.name,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
