"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const presignRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: file.type, folder: "products" }),
        });
        const { uploadUrl, publicUrl } = await presignRes.json();

        await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        uploaded.push(publicUrl);
      } catch {
        toast({ title: "Не удалось загрузить изображение", variant: "error" });
      }
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
            <Image src={img} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-background/90 p-1 cursor-pointer"
              aria-label="Удалить изображение"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary cursor-pointer"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-xs">Загрузить</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
