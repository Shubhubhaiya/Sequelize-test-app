const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');
const validatePagination = require('../middleware/validatePagination');
const validateAssignTherapeuticAreas = require('../middleware/validateAssignTherapeuticAreas');

/**
 * @swagger
 * /therapeutic-areas:
 *   get:
 *     summary: Retrieve a list of all therapeutic areas
 *     description: Retrieve a paginated list of all therapeutic areas. Supports filtering by userId to get associated therapeutic areas.
 *     tags:
 *       - Therapeutic Areas
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
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           example: 2
 *         description: ID of the user to filter associated therapeutic areas.
 *     responses:
 *       200:
 *         description: A list of therapeutic areas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TherapeuticAreasResponse'
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
 *     TherapeuticArea:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: Unique identifier of the therapeutic area.
 *         name:
 *           type: string
 *           example: "CRM"
 *           description: Name of the therapeutic area.
 *     Pagination:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           example: 7
 *           description: Total number of records available.
 *         currentPage:
 *           type: integer
 *           example: 1
 *           description: Current page number.
 *         totalPages:
 *           type: integer
 *           example: 1
 *           description: Total number of pages.
 *         pageSize:
 *           type: integer
 *           example: 7
 *           description: Number of records per page.
 *     TherapeuticAreasResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           description: List of therapeutic areas.
 *           items:
 *             $ref: '#/components/schemas/TherapeuticArea'
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

router.get('/', validatePagination, therapeuticAreasController.getList);

/**
 * @swagger
 * /therapeutic-areas:
 *   get:
 *     summary: Retrieve a list of all therapeutic areas
 *     description: Retrieve a paginated list of all therapeutic areas. Supports filtering by userId to get associated therapeutic areas.
 *     tags:
 *       - Therapeutic Areas
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
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           example: 2
 *         description: ID of the user to filter associated therapeutic areas.
 *     responses:
 *       200:
 *         description: A list of therapeutic areas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TherapeuticAreasResponse'
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
 *     TherapeuticArea:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: Unique identifier of the therapeutic area.
 *         name:
 *           type: string
 *           example: "CRM"
 *           description: Name of the therapeutic area.
 *     TherapeuticAreasResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           description: List of therapeutic areas.
 *           items:
 *             $ref: '#/components/schemas/TherapeuticArea'
 *         error:
 *           type: object
 *           nullable: true
 *           example: null
 *           description: Error object if an error occurred; otherwise, null.
 *         status:
 *           type: integer
 *           example: 200
 *           description: HTTP status code.
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
 *     AssignTherapeuticAreaRequest:
 *       type: object
 *       required:
 *         - adminUserId
 *         - dealLeadId
 *         - therapeuticAreaIds
 *       properties:
 *         adminUserId:
 *           type: integer
 *           description: ID of the admin user performing the assignment.
 *           example: 1
 *         dealLeadId:
 *           type: integer
 *           description: ID of the deal lead to assign the therapeutic areas.
 *           example: 2
 *         therapeuticAreaIds:
 *           type: array
 *           description: List of therapeutic area IDs to be assigned.
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 */

/**
 * @swagger
 * /therapeutic-areas/assign:
 *   post:
 *     summary: Assign therapeutic areas to a deal lead
 *     description: Assign multiple therapeutic areas to a deal lead. Only a system admin can perform this operation.
 *     tags:
 *       - Therapeutic Areas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTherapeuticAreaRequest'
 *     responses:
 *       200:
 *         description: Therapeutic areas assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Therapeutic Areas assigned successfully."
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required and therapeuticAreaIds should be a non-empty array."
 *                 error:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only SystemAdmins can assign TherapeuticAreas."
 *                 error:
 *                   type: object
 *                   example: {}
 *       404:
 *         description: Not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "TherapeuticArea with ID 4 not found."
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

router.post(
  '/assign',
  validateAssignTherapeuticAreas,
  therapeuticAreasController.assignTherapeuticArea
);

module.exports = router;
