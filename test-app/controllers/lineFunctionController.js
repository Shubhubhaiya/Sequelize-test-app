const ResponseCodes = require('../utils/responseCode');
const lineFunctionService = require('../services/lineFunctionService');

const getAllLineFunctions = async (req, res) => {
  const response = new ResponseCodes();

  try {
    const { count, rows } = await lineFunctionService.findAndCountAll();
    const result = response.success(
      { totalRecords: count, lineFunctions: rows },
      'Line functions fetched successfully!'
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
  getAllLineFunctions
};
