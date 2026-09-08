import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";

export const metadata = { title: "Редактировать товар" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { shop: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();
  if (product.shop.ownerId !== session.user.id && session.user.role !== "ADMIN") notFound();

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Редактировать товар</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? "",
          stock: product.stock.toString(),
          categoryId: product.categoryId,
          images: product.images,
        }}
      />
    </div>
  );
}
