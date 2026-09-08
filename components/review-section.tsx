"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDate, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Review = { id: string; rating: number; comment: string | null; createdAt: string; userName: string | null };

export function ReviewSection({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function submitReview() {
    setLoading(true);
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Не удалось отправить отзыв", description: data.error?.toString?.(), variant: "error" });
      return;
    }
    toast({ title: "Спасибо за отзыв!", variant: "success" });
    setComment("");
    router.refresh();
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-6 font-heading text-xl font-semibold">Отзывы ({reviews.length})</h2>

      <div className="mb-8 max-w-lg rounded-lg border p-4">
        <p className="mb-2 text-sm font-medium">Оставить отзыв</p>
        <div className="mb-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} aria-label={`${i} звёзд`} className="cursor-pointer">
              <Star className={cn("h-6 w-6", i <= rating ? "fill-accent text-accent" : "fill-muted text-muted")} />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Расскажите о вашем опыте использования товара..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button className="mt-3" onClick={submitReview} disabled={loading}>
          {loading ? "Отправка..." : "Отправить отзыв"}
        </Button>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 && <p className="text-sm text-muted-foreground">Пока нет отзывов. Будьте первым!</p>}
        {reviews.map((r) => (
          <div key={r.id} className="border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={cn("h-4 w-4", i <= r.rating ? "fill-accent text-accent" : "fill-muted text-muted")} />
                ))}
              </div>
              <span className="text-sm font-medium">{r.userName ?? "Пользователь"}</span>
              <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
