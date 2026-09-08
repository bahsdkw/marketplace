"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`,
    });
  }

  function handleLeave() {
    setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)" });
  }

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)", ...style }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </div>
  );
}
