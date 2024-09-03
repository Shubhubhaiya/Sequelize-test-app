const ResponseCodes = require('../utils/response.code');
const { sampleUsers } = require('../utils/user.list');

let responseCode = new ResponseCodes();
let serverStatus = responseCode.serverError().status;
let successStatus = responseCode.success().status;

const getUsers = async (req, res) => {
  try {
    responseCode.message = 'Users list fetched sucessfully!';
    responseCode.data = sampleUsers;
    return res.status(successStatus).send(responseCode.success());
  } catch (error) {
    responseCode.message = 'Something went wrong - Please try again.';
    responseCode.error = error;
    return res.status(serverStatus).send(responseCode.serverError());
  }
};

module.exports = {
  getUsers
};
