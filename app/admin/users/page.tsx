import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { UserRoleControl } from "@/components/user-role-control";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Пользователи — Админ-панель" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, shop: { select: { name: true } } },
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Имя</th>
            <th className="p-3">Email</th>
            <th className="p-3">Роль</th>
            <th className="p-3">Регистрация</th>
            <th className="p-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.name ?? "—"} {u.shop && <Badge variant="secondary" className="ml-2">{u.shop.name}</Badge>}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{formatDate(u.createdAt)}</td>
              <td className="p-3 text-right">
                <UserRoleControl userId={u.id} currentRole={u.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
