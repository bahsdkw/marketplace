import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shopSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

  const existing = await prisma.shop.findUnique({ where: { ownerId: session.user.id } });
  if (existing) return NextResponse.json({ error: "У вас уже есть магазин" }, { status: 409 });

  const body = await req.json();
  const parsed = shopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const slug = `${slugify(parsed.data.name)}-${Math.random().toString(36).slice(2, 6)}`;

  const shop = await prisma.shop.create({
    data: { ownerId: session.user.id, name: parsed.data.name, description: parsed.data.description, slug },
  });

  await prisma.user.update({ where: { id: session.user.id }, data: { role: "SELLER" } });

  return NextResponse.json(shop, { status: 201 });
}

export async function GET() {
  const shops = await prisma.shop.findMany({
    where: { status: "APPROVED" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(shops);
}
