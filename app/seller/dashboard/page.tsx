import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, DollarSign, Eye, ShoppingBag, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/tilt-card";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";

export const metadata = { title: "Кабинет продавца" };

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    include: { products: true, orders: { include: { items: true }, orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!shop) redirect("/seller/onboarding");

  const revenueAgg = await prisma.order.aggregate({
    where: { shopId: shop.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    _sum: { total: true },
  });
  const totalViews = shop.products.reduce((sum, p) => sum + p.views, 0);

  const stats = [
    { label: "Доход", value: formatPrice((revenueAgg._sum.total ?? 0).toString()), icon: DollarSign },
    { label: "Товары", value: shop.products.length, icon: Package },
    { label: "Просмотры", value: totalViews, icon: Eye },
    { label: "Заказы", value: shop.orders.length, icon: ShoppingBag },
  ];

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{shop.name}</h1>
          {shop.status === "PENDING" && (
            <Badge className="mt-1 bg-yellow-100 text-yellow-800">На модерации</Badge>
          )}
          {shop.status === "SUSPENDED" && <Badge className="mt-1 bg-red-100 text-red-800">Заблокирован</Badge>}
        </div>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="mr-2 h-4 w-4" /> Добавить товар
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Товары</CardTitle>
            <Link href="/seller/products" className="text-sm text-primary hover:underline">
              Все товары
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {shop.products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1">{p.title}</span>
                <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>{p.status}</Badge>
              </div>
            ))}
            {shop.products.length === 0 && <p className="text-sm text-muted-foreground">Пока нет товаров</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние заказы</CardTitle>
            <Link href="/seller/orders" className="text-sm text-primary hover:underline">
              Все заказы
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {shop.orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span>#{o.id.slice(-8)}</span>
                <Badge className={ORDER_STATUS_COLORS[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
              </div>
            ))}
            {shop.orders.length === 0 && <p className="text-sm text-muted-foreground">Пока нет заказов</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
