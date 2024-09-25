const statusCodes = require('../config/statusCodes');
const dealService = require('../services/dealService');
const apiResponse = require('../utils/apiResponse');

const createDeal = async (req, res, next) => {
  try {
    const result = await dealService.createDeal(req.body);
    return res.status(statusCodes.CREATED).json(apiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const updateDeal = async (req, res) => {
  const dealId = parseInt(req.params.id);
  const data = req.body;
  const result = await dealService.updateDeal(dealId, data);
  return res.status(result.status).send(result);
};

const deleteDeal = async (req, res) => {
  const dealId = parseInt(req.params.id);
  const userId = parseInt(req.body.userId);
  const result = await dealService.deleteDeal(dealId, userId);
  return res.status(result.status).send(result);
};

const getDealDetail = async (req, res) => {
  const dealId = req.params.id;
  const result = await dealService.getDealDetail(dealId);
  return res.status(result.status).send(result);
};

const getDealsList = async (req, res) => {
  const result = await dealService.getDealsList(req.body);
  return res.status(result.status).send(result);
};

module.exports = {
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetail,
  getDealsList
};
