const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const validatePagination = require('../middleware/validatePagination');

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
 *               $ref: '#/components/schemas/StagesResponse'
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
 *     Stage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: The unique identifier of the stage.
 *         name:
 *           type: string
 *           example: "Triage"
 *           description: The name of the stage.
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
 *     StagesResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           description: List of stages.
 *           items:
 *             $ref: '#/components/schemas/Stage'
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

// Route to get all stages
router.get('/', validatePagination, stageController.getList);

module.exports = router;
