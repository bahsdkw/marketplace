import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await prisma.product.update({ where: { id: params.id }, data: { views: { increment: 1 } } });
  return NextResponse.json({ ok: true });
}
