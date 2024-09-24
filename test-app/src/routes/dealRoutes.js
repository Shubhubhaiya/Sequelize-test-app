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
 *             $ref: '#/components/schemas/CreateDealRequest'
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
 *
 * components:
 *   schemas:
 *     CreateDealRequest:
 *       type: object
 *       required:
 *         - name
 *         - stage
 *         - therapeuticArea
 *         - userId
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the deal.
 *           example: "New Deal"
 *         stage:
 *           type: integer
 *           description: The ID of the stage.
 *           example: 1
 *         therapeuticArea:
 *           type: integer
 *           description: The ID of the therapeutic area.
 *           example: 7
 *         userId:
 *           type: integer
 *           description: The ID of the user creating the deal.
 *           example: 1
 *         dealLead:
 *           type: integer
 *           description: (Optional) The ID of the deal lead.
 *           example: 2
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

/**
 * @swagger
 * /deals/{id}:
 *   put:
 *     summary: Update an existing deal
 *     description: Updates a deal. The deal `id` is not editable, but all other fields are.
 *     tags:
 *       - Deals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the deal to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDealRequest'
 *     responses:
 *       200:
 *         description: Deal updated successfully
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
 *                       example: "Deal updated successfully"
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
 *                       example: "Invalid Stage ID"
 *                 status:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: Deal Not Found
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
 *                       example: "Deal not found"
 *                 status:
 *                   type: integer
 *                   example: 404
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
 *
 * components:
 *   schemas:
 *     UpdateDealRequest:
 *       type: object
 *       required:
 *         - name
 *         - stage
 *         - therapeuticArea
 *         - userId
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the deal.
 *           example: "Updated Deal Name"
 *         stage:
 *           type: integer
 *           description: The ID of the stage.
 *           example: 1
 *         therapeuticArea:
 *           type: integer
 *           description: The ID of the therapeutic area.
 *           example: 7
 *         userId:
 *           type: integer
 *           description: The ID of the user updating the deal.
 *           example: 1
 *         dealLead:
 *           type: integer
 *           description: (Optional) The ID of the deal lead.
 *           example: 2
 */

router.put('/:id', validateCreateDealSchema, dealController.updateDeal);

/**
 * @swagger
 * /deals/{id}:
 *   delete:
 *     summary: Delete a deal
 *     description: Deletes a deal by its ID. Only the deal lead who created the deal or a system admin can delete the deal.
 *     tags:
 *       - Deals
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the deal to be deleted.
 *         schema:
 *           type: integer
 *       - in: body
 *         name: userId
 *         required: true
 *         description: The ID of the user performing the deletion.
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *           properties:
 *             userId:
 *               type: integer
 *               description: ID of the user
 *               example: 5
 *     responses:
 *       200:
 *         description: Deal successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deal successfully deleted
 *                 status:
 *                   type: integer
 *                   example: 200
 *       403:
 *         description: User is not authorized to delete the deal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to delete this deal
 *                 status:
 *                   type: integer
 *                   example: 403
 *       404:
 *         description: Deal not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deal not found or already deleted
 *                 status:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Due to some technical issue, we cannot process your request, please check back later!
 *                 status:
 *                   type: integer
 *                   example: 500
 */

router.delete('/:id', dealController.deleteDeal);

/**
 * @swagger
 * /deals/{dealId}:
 *   get:
 *     summary: Get details of a specific deal
 *     description: Fetch detailed information of a deal, including stage, therapeutic area, and deal leads.
 *     tags:
 *       - Deals
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the deal to retrieve
 *     responses:
 *       200:
 *         description: Successful response with deal details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "test deal2"
 *                     stage:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Triage"
 *                     therapeuticArea:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "CRM"
 *                     dealLeads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: "deal2.lead@example.com"
 *                           novartis521ID:
 *                             type: string
 *                             example: "deal@novartis.neta"
 *                           firstName:
 *                             type: string
 *                             example: "DealLeadFirstname2"
 *                           lastName:
 *                             type: string
 *                             example: "DalLeadLastName2"
 *                           title:
 *                             type: string
 *                             example: "Deal Leader"
 *                 error:
 *                   type: null
 *                 status:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: Deal not found
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
 *                       example: "Deal not found"
 *                 status:
 *                   type: integer
 *                   example: 404
 */

router.get('/:id', dealController.getDealDetail);

/**
 * @swagger
 * /deals/list:
 *   post:
 *     summary: Get deals list with filters and pagination
 *     description: Fetch deals based on filters, with pagination.
 *     tags:
 *       - Deals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               filters:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Deal Name"
 *                   therapeuticArea:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     example: [1, 2, 3]
 *                   stage:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     example: [1, 2, 3]
 *                   createdBy:
 *                     type: string
 *                     example: "John"
 *                   createdAt:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-24"
 *                   modifiedBy:
 *                     type: string
 *                     example: "Doe"
 *                   modifiedAt:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-24"
 *                   dealLead:
 *                     type: string
 *                     example: "LeadName"
 *               page:
 *                 type: integer
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Successful response
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
 *                       name:
 *                         type: string
 *                       therapeuticArea:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       stage:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       createdBy:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       modifiedBy:
 *                         type: integer
 *                       modifiedAt:
 *                         type: string
 *                         format: date-time
 *                       dealLeads:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 */
router.post('/list', dealController.getDealsList);

module.exports = router;
