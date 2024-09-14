require('dotenv').config();
const jwt = require('jsonwebtoken');

const ResponseCodes = require('../utils/response.code');

let responseCode = new ResponseCodes();
let unauthorized_status = responseCode.unauthorized().status;

const verifyUserToken = async () => {
  return async (req, res, next) => {
    try {
      if (req.headers.authorization == undefined) {
        return res
          .status(unauthorized_status)
          .send(responseCode.unauthorized());
      }

      const token = req.headers.authorization.split(' ')[1];
      const user = jwt.verify(token, process.env.TOKEN_HASH);
      res.locals.user = user;
      next();
    } catch (err) {
      return res.status(unauthorized_status).send(responseCode.unauthorized());
    }
  };
};

export default verifyUserToken;
