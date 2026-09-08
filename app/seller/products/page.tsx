import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/delete-product-button";

export const metadata = { title: "Мои товары" };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default async function SellerProductsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await prisma.shop.findUnique({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/seller/onboarding");

  const products = await prisma.product.findMany({ where: { shopId: shop.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Мои товары</h1>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="mr-2 h-4 w-4" /> Добавить товар
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Товар</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Остаток</th>
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
                  <span className="line-clamp-1">{p.title}</span>
                </td>
                <td className="p-3">{formatPrice(p.price.toString())}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <Badge className={STATUS_BADGE[p.status]}>{p.status}</Badge>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/seller/products/${p.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteProductButton productId={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-muted-foreground">Пока нет товаров</p>}
      </div>
    </div>
  );
}
