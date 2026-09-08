import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product-gallery";
import { ProductActions } from "@/components/product-actions";
import { StarRating } from "@/components/star-rating";
import { ReviewSection } from "@/components/review-section";
import { formatPrice } from "@/lib/utils";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      shop: true,
      category: true,
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  return product;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.status !== "PUBLISHED") notFound();

  return (
    <div className="container-page py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <span>{product.category.name}</span> / <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <a href={`/shops/${product.shop.slug}`} className="text-sm font-medium text-primary hover:underline">
            {product.shop.name}
          </a>
          <h1 className="mt-1 font-heading text-2xl font-bold md:text-3xl">{product.title}</h1>
          <div className="mt-2">
            <StarRating value={product.ratingAvg} count={product.ratingCount} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-heading text-3xl font-bold text-primary">{formatPrice(product.price.toString())}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice.toString())}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {product.stock > 0 ? `В наличии: ${product.stock} шт.` : "Нет в наличии"}
          </p>

          <ProductActions
            product={{
              id: product.id,
              title: product.title,
              price: Number(product.price),
              image: product.images[0] ?? "",
              stock: product.stock,
              shopId: product.shopId,
              shopName: product.shop.name,
            }}
          />

          <div className="mt-8 space-y-2">
            <h2 className="font-heading text-lg font-semibold">Описание</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>

      <ReviewSection
        productId={product.id}
        reviews={product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          userName: r.user.name,
        }))}
      />
    </div>
  );
}
