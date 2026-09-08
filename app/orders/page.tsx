import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";

export const metadata = { title: "Мои заказы" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { items: true, shop: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Мои заказы</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">У вас пока нет заказов.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border p-4 transition-colors hover:border-primary"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Заказ #{order.id.slice(-8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shop.name} · {formatDate(order.createdAt)} · {order.items.length} товар(ов)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  <span className="font-semibold">{formatPrice(order.total.toString())}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
