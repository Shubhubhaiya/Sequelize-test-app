const dealService = require('../services/dealService');

const createDeal = async (req, res) => {
  const result = await dealService.createDeal(req.body);
  return res.status(result.status).send(result);
};

const updateDeal = async (req, res) => {
  const dealId = parseInt(req.params.id);
  const data = req.body;
  const result = await dealService.updateDeal(dealId, data);
  return res.status(result.status).send(result);
};

module.exports = {
  createDeal,
  updateDeal
};
