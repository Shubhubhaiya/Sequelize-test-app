const stageService = require('../services/stageService');

const getList = async (req, res) => {
  const result = await stageService.getAllStages(req.query);
  return res.status(result.status).send(result);
};

module.exports = {
  getList
};
