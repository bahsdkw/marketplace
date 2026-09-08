import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ProductModerationControl } from "@/components/product-moderation-control";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Товары — Админ-панель" };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { shop: { select: { name: true } }, category: { select: { name: true } } },
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Товар</th>
            <th className="p-3">Магазин</th>
            <th className="p-3">Цена</th>
            <th className="p-3">Статус</th>
            <th className="p-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="flex items-center gap-3 p-3">
                <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                  <Image src={p.images[0] ?? "/placeholder.svg"} alt="" fill className="object-cover" />
                </div>
                {p.title}
              </td>
              <td className="p-3">{p.shop.name}</td>
              <td className="p-3">{formatPrice(p.price.toString())}</td>
              <td className="p-3">
                <Badge className={STATUS_BADGE[p.status]}>{p.status}</Badge>
              </td>
              <td className="p-3 text-right">
                <ProductModerationControl productId={p.id} currentStatus={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
