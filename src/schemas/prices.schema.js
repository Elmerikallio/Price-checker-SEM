import { z } from 'zod';

// Price observation from shopper app
export const priceObservationSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  barcodeType: z.string().min(1, 'Barcode type is required'),
  price: z.number().positive('Price must be positive'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  timestamp: z.string().datetime().optional(),
  productName: z.string().optional(), // Optional product name
});

// Enhanced schema for store users to add product-price information objects
export const storeProductPriceSchema = z.object({
  products: z.array(z.object({
    // Barcode data
    barcode: z.string().min(1, 'Barcode is required'),
    barcodeType: z.enum(['EAN13', 'EAN8', 'UPC_A', 'UPC_E', 'CODE128', 'CODE39'], 'Invalid barcode type'),
    gtin: z.string().min(8, 'GTIN number must be at least 8 digits'), // Global Trade Item Number
    
    // Location data (user's location in latitudes and longitudes)
    latitude: z.number().min(-90).max(90, 'Invalid latitude'),
    longitude: z.number().min(-180).max(180, 'Invalid longitude'),
    
    // Price information
    price: z.number().positive('Price must be positive'),
    currency: z.string().min(3).max(3).default('EUR'), // ISO currency code
    
    // Timestamp
    timestamp: z.string().datetime().optional().transform(val => val || new Date().toISOString()),
    
    // Optional product details
    productName: z.string().optional(),
    productCategory: z.string().optional(),
    brand: z.string().optional(),
    
    // Additional metadata
    source: z.enum(['MANUAL', 'SCANNER', 'API']).default('MANUAL'),
    notes: z.string().optional()
  })).min(1, 'At least one product is required').max(100, 'Maximum 100 products per batch')
});

// Batch price upload from stores
export const batchPriceSchema = z.object({
  prices: z.array(z.object({
    barcode: z.string().min(1),
    barcodeType: z.string().min(1),
    price: z.number().positive(),
    productName: z.string().optional(),
  })).min(1, 'At least one price is required').max(1000, 'Too many prices in batch'),
});

// Query nearby prices
export const nearbyPricesQuerySchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  barcodeType: z.string().min(1, 'Barcode type is required'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  radiusKm: z.number().positive().max(50, 'Radius too large').default(5),
  includeInactive: z.boolean().default(false),
});

// Get nearby prices (simple version for URL query params)
export const getNearbyPricesSchema = z.object({
  gtin: z.string().min(1, 'GTIN is required'),
  lat: z.string().transform(val => parseFloat(val)).pipe(z.number().min(-90).max(90)),
  lng: z.string().transform(val => parseFloat(val)).pipe(z.number().min(-180).max(180)),
  radius: z.string().transform(val => parseFloat(val)).pipe(z.number().positive().max(50)).optional(),
});