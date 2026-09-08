import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUploadUrl } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { fileType, folder } = await req.json();

  if (!fileType?.startsWith("image/")) {
    return NextResponse.json({ error: "Разрешены только изображения" }, { status: 400 });
  }

  const result = await getUploadUrl(fileType, folder ?? "products");
  return NextResponse.json(result);
}
