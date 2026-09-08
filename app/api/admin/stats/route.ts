import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const [userCount, shopCount, productCount, orderCount, revenueAgg, pendingShops, pendingProducts] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, _sum: { total: true } }),
    prisma.shop.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    userCount,
    shopCount,
    productCount,
    orderCount,
    revenue: revenueAgg._sum.total ?? 0,
    pendingShops,
    pendingProducts,
  });
}
