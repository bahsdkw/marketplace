import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusControl } from "@/components/order-status-control";
import { formatDate, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Заказы моего магазина" };

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await prisma.shop.findUnique({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/seller/onboarding");

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id },
    include: { items: true, buyer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Заказы</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">Заказ #{order.id.slice(-8)}</p>
                <p className="text-sm text-muted-foreground">
                  {order.buyer.name} · {formatDate(order.createdAt)} · {formatPrice(order.total.toString())}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                <OrderStatusControl orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t pt-3">
              {order.items.map((item) => (
                <p key={item.id} className="text-sm text-muted-foreground">
                  {item.title} × {item.quantity}
                </p>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted-foreground">Пока нет заказов</p>}
      </div>
    </div>
  );
}
