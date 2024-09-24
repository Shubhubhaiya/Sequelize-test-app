const therapeuticAreaService = require('../services/therapeuticAreaService');

const getList = async (req, res) => {
  const result = await therapeuticAreaService.getAllTherapeuticAreas(req.query);
  return res.status(result.status).send(result);
};

const assignTherapeuticArea = async (req, res) => {
  const { adminUserId, dealLeadId, therapeuticAreaIds } = req.body;
  const result = await therapeuticAreaService.assignTherapeuticAreas(
    adminUserId,
    dealLeadId,
    therapeuticAreaIds
  );
  return res.status(result.status).send(result);
};

module.exports = {
  getList,
  assignTherapeuticArea
};
