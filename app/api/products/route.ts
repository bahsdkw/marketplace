import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const perPage = Math.min(48, Number(searchParams.get("perPage") ?? 12));
  const shopId = searchParams.get("shopId") ?? undefined;

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(q && { title: { contains: q, mode: "insensitive" } }),
    ...(category && { category: { slug: category } }),
    ...(shopId && { shopId }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: new Prisma.Decimal(minPrice) }),
        ...(maxPrice && { lte: new Prisma.Decimal(maxPrice) }),
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { ratingAvg: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { shop: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, perPage, totalPages: Math.ceil(total / perPage) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const shop = await prisma.shop.findUnique({ where: { ownerId: session.user.id } });
  if (!shop) {
    return NextResponse.json({ error: "Сначала создайте магазин" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 7)}`;

  const product = await prisma.product.create({
    data: {
      shopId: shop.id,
      categoryId: data.categoryId,
      title: data.title,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      stock: data.stock,
      images: data.images,
      status: "PENDING",
    },
  });

  return NextResponse.json(product, { status: 201 });
}
