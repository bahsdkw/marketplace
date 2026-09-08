import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

type CartLineInput = { productId: string; quantity: number };

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

  const { lines, addressId }: { lines: CartLineInput[]; addressId?: string } = await req.json();
  if (!lines?.length) return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, status: "PUBLISHED" },
    include: { shop: true },
  });

  if (products.length !== lines.length) {
    return NextResponse.json({ error: "Некоторые товары недоступны" }, { status: 400 });
  }

  const byShop = new Map<string, { shopId: string; items: { product: (typeof products)[number]; qty: number }[] }>();

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId)!;
    if (product.stock < line.quantity) {
      return NextResponse.json({ error: `Недостаточно товара на складе: ${product.title}` }, { status: 400 });
    }
    const group = byShop.get(product.shopId) ?? { shopId: product.shopId, items: [] };
    group.items.push({ product, qty: line.quantity });
    byShop.set(product.shopId, group);
  }

  const orders = await Promise.all(
    Array.from(byShop.values()).map(async (group) => {
      const subtotal = group.items.reduce((sum, i) => sum + Number(i.product.price) * i.qty, 0);
      const shippingFee = subtotal >= 50 ? 0 : 5;

      return prisma.order.create({
        data: {
          buyerId: session.user.id,
          shopId: group.shopId,
          addressId: addressId ?? null,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          status: "PENDING",
          items: {
            create: group.items.map((i) => ({
              productId: i.product.id,
              title: i.product.title,
              price: i.product.price,
              quantity: i.qty,
            })),
          },
        },
      });
    })
  );

  const lineItems = Array.from(byShop.values()).flatMap((group) =>
    group.items.map((i) => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.product.title, images: i.product.images.slice(0, 1) },
        unit_amount: Math.round(Number(i.product.price) * 100),
      },
      quantity: i.qty,
    }))
  );

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email ?? undefined,
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: { orderIds: orders.map((o) => o.id).join(",") },
  });

  await prisma.order.updateMany({
    where: { id: { in: orders.map((o) => o.id) } },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
