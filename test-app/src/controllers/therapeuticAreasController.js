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
 *                         example: "CRM"
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
 *             type: object
 *             properties:
 *               adminUserId:
 *                 type: integer
 *                 example: 1
 *               dealLeadId:
 *                 type: integer
 *                 example: 2
 *               therapeuticAreaIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
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
 *                   example: "TherapeuticAreas Oncology, Cardiology assigned to DealLead John Doe successfully."
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

const therapeuticAreaService = require('../services/therapeuticAreaService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res) => {
  try {
    const result = await therapeuticAreaService.getAllTherapeuticAreas(
      req.query
    );
    return res.status(result.status).send(result);
  } catch (error) {
    const result = apiResponse.serverError({ message: error.message });
    return res.status(result.status).send(result);
  }
};

const assignTherapeuticArea = async (req, res) => {
  try {
    const { adminUserId, dealLeadId, therapeuticAreaIds } = req.body;
    const result = await therapeuticAreaService.assignTherapeuticAreas(
      adminUserId,
      dealLeadId,
      therapeuticAreaIds
    );
    return res.status(result.status).send(result);
  } catch (error) {
    const result = apiResponse.serverError({ message: error.message });
    return res.status(result.status).send(result);
  }
};

module.exports = {
  getList,
  assignTherapeuticArea
};
