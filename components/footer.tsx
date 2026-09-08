import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-heading text-lg font-bold text-primary">
            Market<span className="text-accent">place</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Площадка, где продавцы и покупатели находят друг друга.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Покупателям</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-primary">Каталог</Link></li>
            <li><Link href="/orders" className="hover:text-primary">Мои заказы</Link></li>
            <li><Link href="/wishlist" className="hover:text-primary">Избранное</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Продавцам</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/seller/onboarding" className="hover:text-primary">Открыть магазин</Link></li>
            <li><Link href="/seller/dashboard" className="hover:text-primary">Кабинет продавца</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Компания</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">О нас</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Контакты</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Marketplace. Все права защищены.
      </div>
    </footer>
  );
}
