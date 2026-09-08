"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

type User = { id: string; name: string | null; email: string | null; role: string; createdAt: Date };

export function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);

    if (res.ok) {
      toast({ title: "Профиль обновлён", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Не удалось сохранить", variant: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={user.email ?? ""} disabled />
      </div>
      <div className="space-y-1.5">
        <Label>Имя</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Роль</Label>
        <Input value={user.role} disabled />
      </div>
      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Сохраняем..." : "Сохранить"}
      </Button>
    </div>
  );
}
