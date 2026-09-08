import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ShopModerationControl } from "@/components/shop-moderation-control";

export const metadata = { title: "Магазины — Админ-панель" };

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

export default async function AdminShopsPage() {
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, email: true } }, _count: { select: { products: true } } },
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Магазин</th>
            <th className="p-3">Владелец</th>
            <th className="p-3">Товаров</th>
            <th className="p-3">Статус</th>
            <th className="p-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.owner.name} ({s.owner.email})</td>
              <td className="p-3">{s._count.products}</td>
              <td className="p-3">
                <Badge className={STATUS_BADGE[s.status]}>{s.status}</Badge>
              </td>
              <td className="p-3 text-right">
                <ShopModerationControl shopId={s.id} currentStatus={s.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
