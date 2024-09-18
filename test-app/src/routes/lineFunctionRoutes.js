const express = require('express');
const router = express.Router();
const lineFunctionController = require('../controllers/lineFunctionController');
const validatePagination = require('../middleware/validatePagination');

/**
 * @swagger
 * /line-functions:
 *   get:
 *     summary: Retrieve a list of all line functions
 *     description: Retrieve a paginated list of all line functions. Supports pagination through query parameters.
 *     tags:
 *       - Line Functions
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
 *         description: A list of line functions.
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
 *                         example: "Alliance Management"
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

// Route to get all line functions
router.get('/', validatePagination, lineFunctionController.getList);

module.exports = router;
