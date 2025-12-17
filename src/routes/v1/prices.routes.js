import { Router } from "express";
import {
  getNearbyPrices,
  submitObservation,
  getProductPriceHistory,
  getStorePrices,
  submitBatchObservations,
  submitProductPriceList
} from "../../controllers/prices.controller.js";
import { requireAuth, requireStore, optionalAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { priceObservationSchema, storeProductPriceSchema } from "../../schemas/prices.schema.js";

const router = Router();

/**
 * @swagger
 * /prices/nearby:
 *   get:
 *     summary: Compare prices across nearby stores
 *     description: |
 *       **Functional Requirement**: Shopper can compare the price of the product with the prices of stores nearby.
 *       
 *       Backend receives barcode data, user location, product price, and timestamp.
 *       Returns a sorted list (ascending by price) of nearby stores with store name, location, and prices.
 *       Includes current prices only and considers store discounts for app users.
 *       Also returns a price label (very inexpensive, inexpensive, average, expensive, very expensive).
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode (GTIN number)
 *         example: "1234567890123"
 *       - in: query
 *         name: barcodeType
 *         schema:
 *           type: string
 *           enum: [EAN13, EAN8, UPC, CODE128]
 *           default: EAN13
 *         description: Barcode type
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         description: User's latitude coordinate
 *         example: 60.1699
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         description: User's longitude coordinate
 *         example: 24.9384
 *       - in: query
 *         name: currentPrice
 *         schema:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *         description: Current price of the product at user's location
 *         example: 15.99
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           format: double
 *           minimum: 0.1
 *           maximum: 100
 *           default: 5
 *         description: Maximum distance in kilometers (user preference)
 *         example: 10
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 168
 *           default: 24
 *         description: Maximum age of prices in hours (what user considers current)
 *         example: 48
 *     responses:
 *       200:
 *         description: Price comparison retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PriceComparison'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found or no nearby stores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/nearby", optionalAuth, getNearbyPrices);

/**
 * @swagger
 * /prices/product/{barcode}:
 *   get:
 *     summary: Get product price history
 *     description: Retrieve historical price data for a specific product across all stores
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode (GTIN number)
 *         example: "1234567890123"
 *     responses:
 *       200:
 *         description: Price history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 priceHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       store:
 *                         $ref: '#/components/schemas/Store'
 *                       prices:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Price'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/product/:barcode", getProductPriceHistory);

/**
 * @swagger
 * /prices/product/{barcode}/{barcodeType}:
 *   get:
 *     summary: Get product price history with specific barcode type
 *     description: Retrieve historical price data for a product with specified barcode type
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode (GTIN number)
 *         example: "1234567890123"
 *       - in: path
 *         name: barcodeType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [EAN13, EAN8, UPC, CODE128]
 *         description: Barcode type
 *         example: "EAN13"
 *     responses:
 *       200:
 *         description: Price history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 priceHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       store:
 *                         $ref: '#/components/schemas/Store'
 *                       prices:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Price'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/product/:barcode/:barcodeType", getProductPriceHistory);

/**
 * @swagger
 * /prices/observations:
 *   post:
 *     summary: Submit price observation
 *     description: |
 *       Submit a single price observation from a shopper.
 *       Backend receives barcode data, user location, product price, and timestamp.
 *       Data is saved for price comparison functionality.
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barcode
 *               - barcodeType
 *               - price
 *               - latitude
 *               - longitude
 *             properties:
 *               barcode:
 *                 type: string
 *                 description: Product barcode (GTIN number)
 *                 example: "1234567890123"
 *               barcodeType:
 *                 type: string
 *                 enum: [EAN13, EAN8, UPC, CODE128]
 *                 description: Barcode type
 *                 example: "EAN13"
 *               price:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: Product price
 *                 example: 15.99
 *               latitude:
 *                 type: number
 *                 format: double
 *                 minimum: -90
 *                 maximum: 90
 *                 description: User's latitude coordinate
 *                 example: 60.1699
 *               longitude:
 *                 type: number
 *                 format: double
 *                 minimum: -180
 *                 maximum: 180
 *                 description: User's longitude coordinate
 *                 example: 24.9384
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Price observation timestamp (optional, defaults to current time)
 *               storeId:
 *                 type: integer
 *                 description: Store ID if observation is from a known store
 *     responses:
 *       201:
 *         description: Price observation submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Price observation submitted successfully"
 *                 observation:
 *                   $ref: '#/components/schemas/Price'
 *       400:
 *         description: Invalid observation data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/observations", 
  requireAuth, 
  validate(priceObservationSchema), 
  submitObservation
);

/**
 * @swagger
 * /prices/store/prices:
 *   get:
 *     summary: Get store's price list (Store users only)
 *     description: Retrieve all products and their current prices for the authenticated store user's store
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or barcode
 *     responses:
 *       200:
 *         description: Store prices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *                       price:
 *                         type: number
 *                         format: decimal
 *                       discount:
 *                         $ref: '#/components/schemas/Discount'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Store user access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/store/prices", requireStore, getStorePrices);

/**
 * @swagger
 * /prices/batch:
 *   post:
 *     summary: Submit batch price observations (Store users only)
 *     description: |
 *       **Functional Requirement**: Store users can add prices in batches.
 *       
 *       Store users can submit a list of product-price information objects containing
 *       barcode data, location, prices, and timestamps. These are store prices available in stores.
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observations
 *             properties:
 *               observations:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 1000
 *                 items:
 *                   type: object
 *                   required:
 *                     - barcode
 *                     - barcodeType
 *                     - price
 *                   properties:
 *                     barcode:
 *                       type: string
 *                       description: Product barcode (GTIN number)
 *                       example: "1234567890123"
 *                     barcodeType:
 *                       type: string
 *                       enum: [EAN13, EAN8, UPC, CODE128]
 *                       description: Barcode type
 *                       example: "EAN13"
 *                     price:
 *                       type: number
 *                       format: decimal
 *                       minimum: 0
 *                       description: Product price in store
 *                       example: 15.99
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Price timestamp (optional)
 *     responses:
 *       201:
 *         description: Batch observations submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Batch observations submitted successfully"
 *                 processed:
 *                   type: integer
 *                   example: 150
 *                 failed:
 *                   type: integer
 *                   example: 0
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       index:
 *                         type: integer
 *                       error:
 *                         type: string
 *       400:
 *         description: Invalid batch data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Store user access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/batch", requireStore, submitBatchObservations);

/**
 * @swagger
 * /prices/products:
 *   post:
 *     summary: Submit store product price list with discounts (Store users only)
 *     description: |
 *       **Functional Requirement**: Store users can offer discounts for some products for App users only.
 *       Store users can add mappings of products and reductions.
 *       Backend system considers the reductions when returning prices.
 *       
 *       Submit a comprehensive product price list for the store, including discount information.
 *     tags: [Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - barcode
 *                     - barcodeType
 *                     - price
 *                   properties:
 *                     barcode:
 *                       type: string
 *                       description: Product barcode (GTIN number)
 *                       example: "1234567890123"
 *                     barcodeType:
 *                       type: string
 *                       enum: [EAN13, EAN8, UPC, CODE128]
 *                       description: Barcode type
 *                       example: "EAN13"
 *                     price:
 *                       type: number
 *                       format: decimal
 *                       minimum: 0
 *                       description: Regular product price
 *                       example: 15.99
 *                     productName:
 *                       type: string
 *                       description: Product name (optional)
 *                       example: "Premium Coffee Beans 500g"
 *                     discount:
 *                       type: object
 *                       description: Discount information for app users
 *                       properties:
 *                         percentage:
 *                           type: number
 *                           format: decimal
 *                           minimum: 0
 *                           maximum: 100
 *                           description: Discount percentage (0-100)
 *                           example: 15.5
 *                         validFrom:
 *                           type: string
 *                           format: date-time
 *                           description: Discount valid from
 *                         validTo:
 *                           type: string
 *                           format: date-time
 *                           description: Discount valid until
 *     responses:
 *       201:
 *         description: Product price list submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product price list updated successfully"
 *                 processed:
 *                   type: integer
 *                   example: 100
 *                 discountsAdded:
 *                   type: integer
 *                   example: 25
 *       400:
 *         description: Invalid product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Store user access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/products", requireStore, validate(storeProductPriceSchema), submitProductPriceList);

export default router;
