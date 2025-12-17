import { Router } from "express";
import {
  getAllStoresForAdmin,
  approveStoreUser,
  rejectStoreUser,
  lockStoreUser,
  unlockStoreUser,
  removeStoreUser,
  getAuditLogs,
  getSystemStats,
  createAdminUser
} from "../../controllers/admin.controller.js";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createUserSchema } from "../../schemas/auth.schema.js";

const router = Router();

// All admin routes require authentication first, then admin role check
router.use(requireAuth);
router.use(requireAdmin);

/**
 * @swagger
 * /admin/stores:
 *   get:
 *     summary: Get all stores for admin review
 *     description: |
 *       **Functional Requirement**: Backend administrator can review sign-up requests from store users.
 *       
 *       Retrieve all stores with their associated users for administrative review and management.
 *       Shows stores in all statuses (pending, active, locked, rejected).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, LOCKED, REJECTED]
 *         description: Filter stores by user status
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
 *                     type: object
 *                     properties:
 *                       store:
 *                         $ref: '#/components/schemas/Store'
 *                       user:
 *                         $ref: '#/components/schemas/User'
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
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stores", getAllStoresForAdmin);

/**
 * @swagger
 * /admin/stores/{id}/approve:
 *   post:
 *     summary: Approve store user account
 *     description: |
 *       **Functional Requirement**: Backend administrator can review sign-up requests from store users.
 *       
 *       Approve a pending store user account, activating it for use.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store user ID to approve
 *     responses:
 *       200:
 *         description: Store user approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Store user approved successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Store user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/stores/:id/approve", approveStoreUser);

/**
 * @swagger
 * /admin/stores/{id}/reject:
 *   post:
 *     summary: Reject store user account
 *     description: |
 *       **Functional Requirement**: Backend administrator can review sign-up requests from store users.
 *       
 *       Reject a pending store user account application.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store user ID to reject
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *                 example: "Invalid store information provided"
 *     responses:
 *       200:
 *         description: Store user rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Store user rejected successfully"
 *       404:
 *         description: Store user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/stores/:id/reject", rejectStoreUser);

/**
 * @swagger
 * /admin/stores/{id}/suspend:
 *   post:
 *     summary: Lock/suspend store user account
 *     description: |
 *       **Functional Requirement**: Backend administrator can lock store user accounts.
 *       
 *       Suspend an active store user account, preventing login and API access.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store user ID to suspend
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for suspension
 *                 example: "Policy violation detected"
 *     responses:
 *       200:
 *         description: Store user locked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Store user locked successfully"
 *       404:
 *         description: Store user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/stores/:id/suspend", lockStoreUser);

/**
 * @swagger
 * /admin/stores/{id}/reactivate:
 *   post:
 *     summary: Unlock/reactivate store user account
 *     description: |
 *       **Functional Requirement**: Backend administrator can unlock store user accounts.
 *       
 *       Reactivate a locked store user account, restoring login and API access.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store user ID to reactivate
 *     responses:
 *       200:
 *         description: Store user reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Store user reactivated successfully"
 *       404:
 *         description: Store user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/stores/:id/reactivate", unlockStoreUser);

/**
 * @swagger
 * /admin/stores/{id}:
 *   delete:
 *     summary: Remove store user account (Super Admin only)
 *     description: |
 *       **Functional Requirement**: Backend administrator can remove store user accounts.
 *       
 *       Permanently delete a store user account and associated data. This action is irreversible
 *       and requires super admin privileges.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store user ID to remove
 *     responses:
 *       200:
 *         description: Store user removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Store user removed successfully"
 *       404:
 *         description: Store user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/stores/:id", requireSuperAdmin, removeStoreUser);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create another admin user (Super Admin only)
 *     description: |
 *       **Functional Requirement**: Backend administrator can create another backend administrator.
 *       
 *       Create a new administrator account. Only super admins can create other administrators.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "admin_user"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@company.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "secureAdminPassword123"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SUPER_ADMIN]
 *                 description: Administrative role level
 *                 example: "ADMIN"
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin user created successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/users", requireSuperAdmin, validate(createUserSchema), createAdminUser);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: |
 *       **Functional Requirement**: Backend shall log admin operations for auditing.
 *       
 *       Retrieve audit logs of administrative operations for compliance and monitoring.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for log filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for log filtering
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
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
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       action:
 *                         type: string
 *                         example: "APPROVE_STORE_USER"
 *                       adminId:
 *                         type: integer
 *                       targetUserId:
 *                         type: integer
 *                       details:
 *                         type: object
 *                       timestamp:
 *                         type: string
 *                         format: date-time
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
 */
router.get("/audit-logs", getAuditLogs);

/**
 * @swagger
 * /admin/statistics:
 *   get:
 *     summary: Get system statistics
 *     description: Retrieve system-wide statistics for administrative monitoring
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     locked:
 *                       type: integer
 *                 stores:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                 prices:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     today:
 *                       type: integer
 *                 products:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 */
router.get("/statistics", getSystemStats);

// Legacy routes (maintain backward compatibility)
router.post("/store-users/:id/approve", approveStoreUser);
router.post("/store-users/:id/lock", lockStoreUser);
router.post("/store-users/:id/unlock", unlockStoreUser);
router.delete("/store-users/:id", requireSuperAdmin, removeStoreUser);

export default router;
