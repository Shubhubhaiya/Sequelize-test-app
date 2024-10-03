const statusCodes = require('../config/statusCodes');
const resourceService = require('../services/resourceService');
const apiResponse = require('../utils/apiResponse');
const xlsx = require('xlsx');

const addResource = async (req, res, next) => {
  try {
    let records = [];
    let isBatch = false;
    const userId = req.body.userId;

    if (req.file) {
      // If an Excel file is provided, read and parse it
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      records = xlsx.utils.sheet_to_json(sheet);
      isBatch = true;
    } else {
      // Otherwise, use the data from the request body for a single record
      records = req.body;
    }

    const result = await resourceService.addResource(records, userId, isBatch);
    return res.status(statusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addResource
};
