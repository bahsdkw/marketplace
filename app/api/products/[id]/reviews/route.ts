import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Войдите, чтобы оставить отзыв" }, { status: 401 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: params.id,
      order: { buyerId: session.user.id, status: { in: ["DELIVERED", "SHIPPED", "PAID"] } },
    },
  });
  if (!purchased) {
    return NextResponse.json({ error: "Отзыв можно оставить только после покупки товара" }, { status: 403 });
  }

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: params.id, userId: session.user.id } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      productId: params.id,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { productId: params.id },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: params.id },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });

  return NextResponse.json(review, { status: 201 });
}
