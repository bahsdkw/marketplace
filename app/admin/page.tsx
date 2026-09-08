import { Users, Store, Package, ShoppingBag, DollarSign, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/tilt-card";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Обзор — Админ-панель" };

export default async function AdminOverviewPage() {
  const [userCount, shopCount, productCount, orderCount, revenueAgg, pendingShops, pendingProducts] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, _sum: { total: true } }),
    prisma.shop.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Пользователи", value: userCount, icon: Users },
    { label: "Магазины", value: shopCount, icon: Store },
    { label: "Товары", value: productCount, icon: Package },
    { label: "Заказы", value: orderCount, icon: ShoppingBag },
    { label: "Общий доход", value: formatPrice((revenueAgg._sum.total ?? 0).toString()), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} className="animate-rise-in" style={{ animationDelay: `${i * 70}ms` }}>
            <TiltCard>
              <Card className="hover:shadow-soft-lg">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 font-heading text-2xl font-bold">{s.value}</p>
                  </div>
                  <s.icon className="h-8 w-8 text-primary" />
                </CardContent>
              </Card>
            </TiltCard>
          </div>
        ))}
      </div>

      {(pendingShops > 0 || pendingProducts > 0) && (
        <Card className="border-accent/50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-accent" />
            <p className="text-sm">
              На модерации: {pendingShops} магазин(ов), {pendingProducts} товар(ов).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
