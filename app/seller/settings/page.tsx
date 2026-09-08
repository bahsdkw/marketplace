import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShopSettingsForm } from "@/components/shop-settings-form";

export const metadata = { title: "Настройки магазина" };

export default async function SellerSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await prisma.shop.findUnique({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/seller/onboarding");

  return (
    <div className="container-page max-w-xl py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Настройки магазина</h1>
      <ShopSettingsForm
        shop={{
          name: shop.name,
          description: shop.description ?? "",
          shippingMethods: (shop.shippingMethods as { name: string; price: number }[]) ?? [
            { name: "Стандартная доставка", price: 5 },
          ],
        }}
      />
    </div>
  );
}
