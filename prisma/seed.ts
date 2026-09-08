import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@marketplace.dev" },
    update: {},
    create: { name: "Admin", email: "admin@marketplace.dev", password, role: "ADMIN" },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@marketplace.dev" },
    update: {},
    create: { name: "Иван Продавцов", email: "seller@marketplace.dev", password, role: "SELLER" },
  });

  await prisma.user.upsert({
    where: { email: "buyer@marketplace.dev" },
    update: {},
    create: { name: "Мария Покупателева", email: "buyer@marketplace.dev", password, role: "BUYER" },
  });

  const categories = await Promise.all(
    [
      { name: "Электроника", slug: "electronics" },
      { name: "Одежда", slug: "clothing" },
      { name: "Дом и сад", slug: "home-garden" },
      { name: "Красота", slug: "beauty" },
      { name: "Спорт", slug: "sports" },
    ].map((c) =>
      prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
    )
  );

  const shop = await prisma.shop.upsert({
    where: { ownerId: sellerUser.id },
    update: {},
    create: {
      ownerId: sellerUser.id,
      name: "TechHub Store",
      slug: "techhub-store",
      description: "Лучшая электроника по честным ценам.",
      status: "APPROVED",
    },
  });

  const sampleImages = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  ];

  const products = [
    { title: "Беспроводные наушники Pro", price: 89.99, compareAtPrice: 119.99, stock: 45, category: "electronics" },
    { title: "Смарт-часы Series X", price: 199.99, compareAtPrice: null, stock: 20, category: "electronics" },
    { title: "Хлопковая футболка Basic", price: 19.99, compareAtPrice: 24.99, stock: 100, category: "clothing" },
    { title: "Керамический набор для кухни", price: 45.5, compareAtPrice: null, stock: 30, category: "home-garden" },
    { title: "Увлажняющий крем для лица", price: 24.99, compareAtPrice: 29.99, stock: 60, category: "beauty" },
    { title: "Йога-мат premium", price: 34.99, compareAtPrice: null, stock: 40, category: "sports" },
  ];

  for (const p of products) {
    const category = categories.find((c) => c.slug === p.category)!;
    const slug = `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        shopId: shop.id,
        categoryId: category.id,
        title: p.title,
        slug,
        description: `${p.title} — качественный товар от TechHub Store. Быстрая доставка и гарантия.`,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        images: sampleImages,
        status: "PUBLISHED",
        ratingAvg: 4.3,
        ratingCount: 12,
      },
    });
  }

  console.log("Seed complete:", { admin: admin.email, seller: sellerUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
