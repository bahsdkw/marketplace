export const metadata = { title: "О нас" };

export default function AboutPage() {
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="mb-4 font-heading text-3xl font-bold">О нас</h1>
      <p className="text-muted-foreground">
        Marketplace — площадка, объединяющая независимых продавцов и покупателей. Мы стремимся сделать онлайн-торговлю
        простой, безопасной и выгодной для всех сторон.
      </p>
    </div>
  );
}
