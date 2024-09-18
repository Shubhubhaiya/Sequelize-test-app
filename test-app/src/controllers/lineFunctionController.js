const lineFunctionService = require('../services/lineFunctionService');

const getList = async (req, res) => {
  const result = await lineFunctionService.getAllLineFunctions(req.query);
  return res.status(result.status).send(result);
};

module.exports = {
  getList
};
