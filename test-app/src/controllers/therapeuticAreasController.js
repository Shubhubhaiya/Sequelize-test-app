const statusCodes = require('../config/statusCodes');
const therapeuticAreaService = require('../services/therapeuticAreaService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res, next) => {
  try {
    const { data, pagination } =
      await therapeuticAreaService.getAllTherapeuticAreas(req.query);

    const successResponse = apiResponse.success(data, pagination);
    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error);
  }
};

const assignTherapeuticArea = async (req, res, next) => {
  try {
    const { adminUserId, dealLeadId, therapeuticAreaIds, unassignTA } =
      req.body;

    const result = await therapeuticAreaService.assignTherapeuticAreas(
      adminUserId,
      dealLeadId,
      therapeuticAreaIds,
      unassignTA
    );

    const successResponse = apiResponse.success(result);
    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};

module.exports = {
  getList,
  assignTherapeuticArea
};
