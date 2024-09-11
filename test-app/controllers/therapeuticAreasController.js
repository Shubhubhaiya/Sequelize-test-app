// therapeuticAreaController.js
const ResponseCodes = require('../utils/responseCode');
const therapeuticAreaService = require('../services/therapeuticAreaService');

const getList = async (req, res) => {
  const response = new ResponseCodes();

  try {
    const { count, rows } = await therapeuticAreaService.findAndCountAll();
    const responseData = {
      totalRecords: count,
      stages: rows
    };
    res
      .status(200)
      .send(
        response.success(
          responseData,
          'Therapeutic Areas fetched successfully!'
        )
      );
  } catch (error) {
    console.error('Failed to fetch therapeutic areas:', error); // Log the error for debugging
    res
      .status(500)
      .send(response.serverError('Unexpected error occurred.', error));
  }
};

module.exports = { getList };
