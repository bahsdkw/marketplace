"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export function UserRoleControl({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter();
  const { toast } = useToast();

  async function updateRole(role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      toast({ title: "Роль обновлена", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Ошибка", variant: "error" });
    }
  }

  return (
    <Select defaultValue={currentRole} onValueChange={updateRole}>
      <SelectTrigger className="ml-auto h-8 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="BUYER">BUYER</SelectItem>
        <SelectItem value="SELLER">SELLER</SelectItem>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
      </SelectContent>
    </Select>
  );
}
