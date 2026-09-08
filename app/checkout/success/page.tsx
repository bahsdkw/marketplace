"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

export default function CheckoutSuccessPage() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <CheckCircle2 className="h-16 w-16 text-primary" />
      <h1 className="mt-4 font-heading text-2xl font-semibold">Заказ успешно оплачен!</h1>
      <p className="mt-2 text-muted-foreground">Мы отправили подтверждение на вашу почту.</p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/orders">Мои заказы</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Продолжить покупки</Link>
        </Button>
      </div>
    </div>
  );
}
