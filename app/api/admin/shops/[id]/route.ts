import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const { status } = await req.json();
  const shop = await prisma.shop.update({ where: { id: params.id }, data: { status } });

  await prisma.notification.create({
    data: {
      userId: shop.ownerId,
      type: status === "APPROVED" ? "SHOP_APPROVED" : "SHOP_REJECTED",
      title: status === "APPROVED" ? "Магазин одобрен" : "Магазин отклонён",
      message:
        status === "APPROVED"
          ? "Ваш магазин прошёл модерацию и теперь виден покупателям."
          : "Ваш магазин не прошёл модерацию.",
      link: "/seller/dashboard",
    },
  });

  return NextResponse.json(shop);
}
