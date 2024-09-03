const ResponseCodes = require("../utils/response.code");
const {sampleUsers} = require('../utils/user.list')

let response_code = new ResponseCodes();
let server_status = response_code.serverError().status;
let success_status = response_code.success().status;

const getUsers = async (req, res) => {
  try {
    response_code.message = 'Users list fetched sucessfully!';
    response_code.data = sampleUsers;
    return res.status(success_status).send(response_code.success());
  } catch (error) {
    response_code.message = 'Something went wrong - Please try again.';
    response_code.error = error;
    return res.status(server_status).send(response_code.serverError());
  }
};

module.exports = {
  getUsers,
};
