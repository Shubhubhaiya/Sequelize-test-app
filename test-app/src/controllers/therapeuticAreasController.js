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
