// middleware/checkRole.js
const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const { SYSTEM_ADMIN } = require('../config/roles');

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // Assuming  user data in req.user
    const userRole = req.user.roleId;

    if (userRole !== requiredRole) {
      return res
        .status(statusCodes.UNAUTHORIZED)
        .send(apiResponse.unauthorized('Unauthorized access.'));
    }
    next();
  };
};

module.exports = checkRole;
