import { Router } from "express";
import { listStores } from "../../controllers/stores.controller.js";

const router = Router();

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: List all active stores
 *     description: |
 *       **Functional Requirement**: Backend maintains the location-store list.
 *       
 *       Retrieve a list of all active stores with their location information.
 *       This supports the location-store mapping functionality where every store is mapped to a location.
 *       Store users are responsible for keeping location information up-to-date.
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         description: Filter stores near this latitude
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         description: Filter stores near this longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: double
 *           minimum: 0.1
 *           maximum: 100
 *           default: 50
 *         description: Search radius in kilometers
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
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stores:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Store'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             format: double
 *                             description: Distance from query point in kilometers (only if lat/lng provided)
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
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listStores);

export default router;
