import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";

export const metadata = { title: "Новый товар" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Добавить товар</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
