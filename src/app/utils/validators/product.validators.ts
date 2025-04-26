// src/app/utils/validators/product.validators.ts
import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const AVAILABLE_TYPES = [
  'bcaa',
  'beta alanine',
  'creatine',
  'whey protein',
] as const;

export const AVAILABLE_BRANDS = [
  'Optimum Nutrition',
  'MyProtein',
  'Yamamoto Nutrition',
] as const;

export const AVAILABLE_SORT = ['none', 'price-asc', 'price-desc'] as const;

export const ProductValidator = z.object({
  _id: z.custom<ObjectId>((val) => val instanceof ObjectId),
  id: z.string(),
  imageUrl: z
    .string()
    .regex(/^[a-zA-Z0-9_\-]+\.(png|jpg|jpeg|webp)$/i, 'Invalid image path'), // different from react
  brand: z.string(),
  name: z.string(),
  type: z.string(),
  suggested_use: z.string(),
  price: z.number().positive(),
});

export type Product = z.infer<typeof ProductValidator>;

// schema to enforce shape on back-end and full type safety on front-end
export const ProductFilterValidator = z.object({
  type: z.array(z.enum(AVAILABLE_TYPES)),
  brand: z.array(z.enum(AVAILABLE_BRANDS)),
  sort: z.enum(AVAILABLE_SORT),
  price: z.tuple([z.number(), z.number()]),
});

// Convert Zod Schema to TypeScript Type. price handled separately due to custom value
export type ProductState = Omit<
  z.infer<typeof ProductFilterValidator>,
  'price'
> & {
  price: { isCustom: boolean; range: [number, number] };
};
