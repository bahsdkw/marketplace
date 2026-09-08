import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-4xl font-bold text-primary">404</h1>
      <p className="mt-2 text-muted-foreground">Страница не найдена</p>
      <Button asChild className="mt-6">
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
