import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/shops", label: "Магазины" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold">Админ-панель</h1>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
