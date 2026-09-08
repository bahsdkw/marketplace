import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import { TiltCard } from "@/components/tilt-card";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  shopName?: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <TiltCard>
      <Card className="group overflow-hidden hover:border-primary hover:shadow-soft-lg">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0] ?? "/placeholder.svg"}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {discount && (
              <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground shadow-soft">
                -{discount}%
              </span>
            )}
            <button
              aria-label="Добавить в избранное"
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft transition-colors hover:text-destructive cursor-pointer"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
          <CardContent className="space-y-1.5 p-3">
            {product.shopName && <p className="text-xs text-muted-foreground">{product.shopName}</p>}
            <h3 className="line-clamp-2 text-sm font-medium">{product.title}</h3>
            <StarRating value={product.ratingAvg} count={product.ratingCount} size={14} />
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-base font-semibold">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    </TiltCard>
  );
}
