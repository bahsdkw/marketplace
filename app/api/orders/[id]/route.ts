import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, shop: true, address: true, buyer: { select: { name: true, email: true } } },
  });

  if (!order) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.shop.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  return NextResponse.json(order);
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { shop: true, buyer: true } });
  if (!order) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });

  const isSeller = order.shop.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isSeller && !isAdmin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const { status, trackingNumber } = await req.json();

  if (status && !isAdmin) {
    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `Нельзя перевести заказ из ${order.status} в ${status}` }, { status: 400 });
    }
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { ...(status && { status }), ...(trackingNumber && { trackingNumber }) },
  });

  if (status) {
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "ORDER_STATUS",
        title: "Статус заказа обновлён",
        message: `Заказ #${order.id.slice(-8)} теперь: ${status}`,
        link: `/orders/${order.id}`,
      },
    });
    if (order.buyer.email) {
      sendOrderStatusEmail({ to: order.buyer.email, orderId: order.id, status }).catch(() => {});
    }
  }

  return NextResponse.json(updated);
}
