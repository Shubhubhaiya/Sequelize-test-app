const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');

/**
 * @swagger
 * /deals/create:
 *   post:
 *     summary: Create a new deal
 *     tags: [Deals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Deal"
 *                 description: "The name of the deal"
 *               stage:
 *                 type: integer
 *                 example: 1
 *                 description: "The ID of the stage"
 *               therapeuticArea:
 *                 type: integer
 *                 example: 1
 *                 description: "The ID of the therapeutic area"
 *               userId:
 *                 type: integer
 *                 example: 1
 *                 description: "The ID of the user creating the deal"
 *               dealLead:
 *                 type: integer
 *                 example: 2
 *                 description: "The ID of the deal lead (optional)"
 *     responses:
 *       200:
 *         description: Deal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Deal'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *                 error:
 *                   type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 */
router.post('/create', dealController.createDeal);

module.exports = router;
