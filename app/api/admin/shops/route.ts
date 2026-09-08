import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, email: true } }, _count: { select: { products: true } } },
  });

  return NextResponse.json(shops);
}
