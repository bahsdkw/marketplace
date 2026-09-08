import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

async function assertOwnership(productId: string, userId: string, role: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { shop: true } });
  if (!product) return null;
  if (role === "ADMIN") return product;
  if (product.shop.ownerId !== userId) return null;
  return product;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      shop: true,
      category: true,
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const owned = await assertOwnership(params.id, session.user.id, session.user.role);
  if (!owned) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const body = await req.json();

  if (session.user.role === "ADMIN" && body.status) {
    const product = await prisma.product.update({ where: { id: params.id }, data: { status: body.status } });
    return NextResponse.json(product);
  }

  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { ...parsed.data, status: "PENDING" },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const owned = await assertOwnership(params.id, session.user.id, session.user.role);
  if (!owned) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
