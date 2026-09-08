import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Введите пароль"),
});

export const productSchema = z.object({
  title: z.string().min(3, "Минимум 3 символа").max(120),
  description: z.string().min(10, "Минимум 10 символов"),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, "Выберите категорию"),
  images: z.array(z.string().url()).min(1, "Добавьте хотя бы одно изображение"),
});

export const shopSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(80),
  description: z.string().max(2000).optional(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postal: z.string().min(2),
  country: z.string().min(2),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ShopInput = z.infer<typeof shopSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
