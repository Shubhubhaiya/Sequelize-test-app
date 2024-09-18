const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const validateCreateDealSchema = require('../middleware/validateDeal');

/**
 * @swagger
 * /deals/create:
 *   post:
 *     summary: Create a new deal
 *     description: Create a new deal with optional Deal Lead association. If Deal Lead is provided, it will be validated against the Therapeutic Area.
 *     tags:
 *       - Deals
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
 *                 description: The name of the deal.
 *               stage:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the stage.
 *               therapeuticArea:
 *                 type: integer
 *                 example: 7
 *                 description: The ID of the therapeutic area.
 *               userId:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the user creating the deal.
 *               dealLead:
 *                 type: integer
 *                 example: 2
 *                 description: (Optional) The ID of the deal lead.
 *     responses:
 *       200:
 *         description: Deal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Deal created successfully"
 *                 error:
 *                   type: null
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "This deal name is already in use."
 *                 status:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Due to some technical issue we cannot process your request, please check back later!"
 *                 status:
 *                   type: integer
 *                   example: 500
 * components:
 *   schemas:
 *     Deal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "New Deal"
 *         currentStage:
 *           type: integer
 *           example: 1
 *         therapeuticArea:
 *           type: integer
 *           example: 7
 *         createdBy:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-09-18T12:34:56Z"
 *         modifiedBy:
 *           type: integer
 *           example: 2
 *         modifiedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-09-19T12:34:56Z"
 *         isDeleted:
 *           type: boolean
 *           example: false
 */

router.post('/create', validateCreateDealSchema, dealController.createDeal);

module.exports = router;
