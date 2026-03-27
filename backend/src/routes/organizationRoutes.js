const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const { validateBody } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: Organization settings and company details
 */

/**
 * @swagger
 * /api/organization:
 *   get:
 *     summary: Fetch company details
 *     tags: [Organization]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Organization record fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Organization fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     logo_url:
 *                       type: string
 *       404:
 *         description: Organization record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *                 message:
 *                   type: string
 *                   example: Organization record not found
 */
router.get('/', authMiddleware, organizationController.getOrganization);

/**
 * @swagger
 * /api/organization:
 *   put:
 *     summary: Update company details
 *     tags: [Organization]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       400:
 *         description: Validation error if name is blank
 */
router.put('/', authMiddleware, requireRole('Admin'), validateBody(['name']), organizationController.updateOrganization);

module.exports = router;