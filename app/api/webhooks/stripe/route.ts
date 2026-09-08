import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderIds = checkoutSession.metadata?.orderIds?.split(",") ?? [];

    if (orderIds.length) {
      const orders = await prisma.order.findMany({ where: { id: { in: orderIds } }, include: { items: true, buyer: true } });

      for (const order of orders) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID", stripePaymentIntentId: checkoutSession.payment_intent as string },
          }),
          ...order.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          ),
          prisma.notification.create({
            data: {
              userId: order.buyerId,
              type: "ORDER_STATUS",
              title: "Заказ оплачен",
              message: `Ваш заказ #${order.id.slice(-8)} успешно оплачен.`,
              link: `/orders/${order.id}`,
            },
          }),
        ]);

        const shop = await prisma.shop.findUnique({ where: { id: order.shopId } });
        if (shop) {
          await prisma.notification.create({
            data: {
              userId: shop.ownerId,
              type: "NEW_ORDER",
              title: "Новый заказ",
              message: `Поступил новый оплаченный заказ #${order.id.slice(-8)}.`,
              link: `/seller/orders/${order.id}`,
            },
          });
        }

        if (order.buyer.email) {
          sendOrderStatusEmail({ to: order.buyer.email, orderId: order.id, status: "PAID" }).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
