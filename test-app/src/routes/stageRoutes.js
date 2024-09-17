/**
 * @swagger
 * /stages:
 *   get:
 *     summary: Retrieve a list of all stages
 *     description: Retrieve a paginated list of all stages. Supports pagination through query parameters.
 *     tags:
 *       - Stages
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of records per page.
 *     responses:
 *       200:
 *         description: A list of stages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Triage"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 50
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Oops! Invalid request, please recheck information!"
 *                 error:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unexpected error occurred."
 *                 error:
 *                   type: object
 *                   example: {}
 */

const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const validatePagination = require('../middleware/validatePagination');

// Route to get all stages
router.get('/', validatePagination, stageController.getList);

module.exports = router;
