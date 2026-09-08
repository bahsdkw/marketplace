"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";
type ToastItem = { id: string; title: string; description?: string; variant: ToastVariant };

const ToastContext = React.createContext<{
  toast: (t: Omit<ToastItem, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in slide-in-from-bottom-2",
              t.variant === "success" && "border-primary/40",
              t.variant === "error" && "border-destructive/40"
            )}
          >
            {t.variant === "success" && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
            {t.variant === "error" && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}
            {t.variant === "default" && <Info className="h-5 w-5 text-muted-foreground shrink-0" />}
            <div className="flex-1 text-sm">
              <p className="font-medium">{t.title}</p>
              {t.description && <p className="text-muted-foreground">{t.description}</p>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
