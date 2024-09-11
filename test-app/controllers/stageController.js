const ResponseCodes = require('../utils/responseCode');
const stageService = require('../services/stageService');

const getList = async (req, res) => {
  const response = new ResponseCodes();

  try {
    const { count, rows } = await stageService.findAndCountAll();
    const result = response.success(
      { totalRecords: count, stages: rows },
      'Stages list fetched successfully!'
    );

    return res.status(result.status).send(result);
  } catch (error) {
    const result = response.serverError(
      'Unexpected error occurred.',
      error.message
    );
    return res.status(result.status).send(result);
  }
};

module.exports = {
  getList
};
