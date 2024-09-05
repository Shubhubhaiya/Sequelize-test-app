const ResponseCodes = require('../utils/responseCode');
const stageService = require('../services/stageService');

const getAllStages = async (req, res) => {
  const response = new ResponseCodes();

  try {
    const stages = await stageService.getAllStages();
    const result = response.success(
      stages,
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
  getAllStages
};
