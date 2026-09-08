"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const list = images.length ? images : ["/placeholder.svg"];

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTiltStyle({
      transform: `perspective(1200px) rotateX(${(py - 0.5) * -10}deg) rotateY(${(px - 0.5) * 10}deg)`,
    });
  }

  function handleLeave() {
    setTiltStyle({ transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)" });
  }

  return (
    <div>
      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)", ...tiltStyle }}
        className="relative aspect-square overflow-hidden rounded-lg bg-muted shadow-soft-lg will-change-transform"
      >
        <Image src={list[active]} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 cursor-pointer transition-all duration-300 ease-soft hover:-translate-y-1",
                active === i ? "border-primary" : "border-transparent"
              )}
              aria-label={`Изображение ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
