import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    include: {
      products: { orderBy: { createdAt: "desc" } },
      orders: { include: { items: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!shop) return NextResponse.json(null);

  const [salesAgg, orderCount] = await Promise.all([
    prisma.order.aggregate({ where: { shopId: shop.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, _sum: { total: true } }),
    prisma.order.count({ where: { shopId: shop.id } }),
  ]);

  const totalViews = shop.products.reduce((sum, p) => sum + p.views, 0);

  return NextResponse.json({
    ...shop,
    stats: {
      revenue: salesAgg._sum.total ?? 0,
      orderCount,
      productCount: shop.products.length,
      totalViews,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json();
  const shop = await prisma.shop.update({
    where: { ownerId: session.user.id },
    data: {
      name: body.name,
      description: body.description,
      logo: body.logo,
      banner: body.banner,
      shippingMethods: body.shippingMethods,
    },
  });

  return NextResponse.json(shop);
}
