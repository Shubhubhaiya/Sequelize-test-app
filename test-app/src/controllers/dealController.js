const dealService = require('../services/dealService');

const createDeal = async (req, res) => {
  const result = await dealService.createDeal(req.body);
  return res.status(result.status).send(result);
};

module.exports = {
  createDeal
};
