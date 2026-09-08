import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return null;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, shop: true, address: true },
  });

  if (!order || (order.buyerId !== session.user.id && session.user.role !== "ADMIN")) notFound();

  return (
    <div className="container-page max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Заказ #{order.id.slice(-8)}</h1>
        <Badge className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold">Информация о заказе</h2>
          <p className="text-sm text-muted-foreground">Магазин: {order.shop.name}</p>
          <p className="text-sm text-muted-foreground">Дата: {formatDate(order.createdAt)}</p>
          {order.trackingNumber && <p className="text-sm text-muted-foreground">Трек-номер: {order.trackingNumber}</p>}
        </div>
        {order.address && (
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-sm font-semibold">Адрес доставки</h2>
            <p className="text-sm text-muted-foreground">
              {order.address.fullName}, {order.address.line1}, {order.address.city}, {order.address.postal},{" "}
              {order.address.country}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b p-4 last:border-b-0">
            <span className="text-sm">{item.title} × {item.quantity}</span>
            <span className="text-sm font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between p-4 text-sm text-muted-foreground">
          <span>Доставка</span>
          <span>{formatPrice(order.shippingFee.toString())}</span>
        </div>
        <div className="flex justify-between border-t p-4 font-semibold">
          <span>Итого</span>
          <span>{formatPrice(order.total.toString())}</span>
        </div>
      </div>
    </div>
  );
}
