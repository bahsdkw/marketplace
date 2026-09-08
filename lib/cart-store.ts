import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  title: string;
  price: number;
  image: string;
  shopId: string;
  shopName: string;
  quantity: number;
  stock: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) => {
        const existing = get().lines.find((l) => l.productId === line.productId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.productId === line.productId
                ? { ...l, quantity: Math.min(l.quantity + qty, l.stock) }
                : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, quantity: qty }] });
        }
      },
      remove: (productId) => set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      setQuantity: (productId, qty) =>
        set({
          lines: get().lines.map((l) =>
            l.productId === productId ? { ...l, quantity: Math.max(1, Math.min(qty, l.stock)) } : l
          ),
        }),
      clear: () => set({ lines: [] }),
      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      totalPrice: () => get().lines.reduce((sum, l) => sum + l.quantity * l.price, 0),
    }),
    { name: "marketplace-cart" }
  )
);
