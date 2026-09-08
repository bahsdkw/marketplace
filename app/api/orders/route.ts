import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 200 });

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { items: true, shop: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
