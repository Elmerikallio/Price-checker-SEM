import { z } from 'zod';

// Update store profile
export const updateStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100).optional(),
  latitude: z.number().min(-90).max(90, 'Invalid latitude').optional(),
  longitude: z.number().min(-180).max(180, 'Invalid longitude').optional(),
});

// Create discount schema
export const createDiscountSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  barcodeType: z.string().min(1, 'Barcode type is required'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0-100').optional(),
  amount: z.number().positive('Discount amount must be positive').optional(),
  description: z.string().max(255, 'Description too long').optional(),
  validUntil: z.string().datetime().optional(),
}).refine((data) => data.percentage || data.amount, {
  message: "Either percentage or fixed amount discount must be provided",
});

// Update discount schema
export const updateDiscountSchema = z.object({
  percentage: z.number().min(0).max(100, 'Percentage must be between 0-100').optional(),
  amount: z.number().positive('Discount amount must be positive').optional(),
  description: z.string().max(255, 'Description too long').optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Admin actions on stores
export const storeActionSchema = z.object({
  action: z.enum(['approve', 'lock', 'unlock']),
  reason: z.string().max(255, 'Reason too long').optional(),
});