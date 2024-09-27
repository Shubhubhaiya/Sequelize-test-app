const statusCodes = require('../config/statusCodes');
const dealService = require('../services/dealService');
const apiResponse = require('../utils/apiResponse');

const createDeal = async (req, res, next) => {
  try {
    const result = await dealService.createDeal(req.body);
    return res.status(statusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const updateDeal = async (req, res, next) => {
  try {
    const dealId = parseInt(req.params.id);
    const data = req.body;
    const result = await dealService.updateDeal(dealId, data);
    return res.status(statusCodes.SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteDeal = async (req, res, next) => {
  try {
    const dealId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId);
    const result = await dealService.deleteDeal(dealId, userId);
    return res.status(statusCodes.SUCCESS).send(result);
  } catch (error) {
    next(error);
  }
};

const getDealDetail = async (req, res, next) => {
  try {
    const dealId = parseInt(req.params.id);
    const result = await dealService.getDealDetail(dealId);
    return res.status(statusCodes.SUCCESS).send(result);
  } catch (error) {
    next(error);
  }
};

const getDealsList = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const { deals, pagination } = await dealService.getDealsList(
      { page, limit },
      req.body
    );

    const successResponse = apiResponse.success(deals, pagination);
    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeal,
  updateDeal,
  deleteDeal,
  getDealDetail,
  getDealsList
};
