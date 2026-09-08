import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/category-manager";

export const metadata = { title: "Категории — Админ-панель" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <CategoryManager
      categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c._count.products }))}
    />
  );
}
