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
 *               $ref: '#/components/schemas/LineFunctionsResponse'
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * components:
 *   schemas:
 *     LineFunction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: The unique identifier of the line function.
 *         name:
 *           type: string
 *           example: "Alliance Management"
 *           description: The name of the line function.
 *     Pagination:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           example: 50
 *           description: Total number of records available.
 *         currentPage:
 *           type: integer
 *           example: 1
 *           description: Current page number.
 *         totalPages:
 *           type: integer
 *           example: 5
 *           description: Total number of pages.
 *         pageSize:
 *           type: integer
 *           example: 10
 *           description: Number of records per page.
 *     LineFunctionsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           description: List of line functions.
 *           items:
 *             $ref: '#/components/schemas/LineFunction'
 *         error:
 *           type: object
 *           nullable: true
 *           example: null
 *           description: Error object if an error occurred; otherwise, null.
 *         status:
 *           type: integer
 *           example: 200
 *           description: HTTP status code.
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Oops! Invalid request, please recheck information!"
 *           description: Error message detailing what went wrong.
 *         error:
 *           type: object
 *           example: {}
 *           description: Additional error details.
 */

// Route to get all line functions
router.get('/', validatePagination, lineFunctionController.getList);

module.exports = router;
