import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { name, image } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, image },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(user);
}
