// const ResponseCodes = require('../utils/response.code');
// const { sampleUsers } = require('../utils/user.list');

// let responseCode = new ResponseCodes();
// let serverStatus = responseCode.serverError().status;
// let successStatus = responseCode.success().status;

// const getUsers = async (req, res) => {
//   try {
//     responseCode.message = 'Users list fetched sucessfully!';
//     responseCode.data = sampleUsers;
//     return res.status(successStatus).send(responseCode.success());
//   } catch (error) {
//     responseCode.message = 'Something went wrong - Please try again.';
//     responseCode.error = error;
//     return res.status(serverStatus).send(responseCode.serverError());
//   }
// };

// module.exports = {
//   getUsers
// };

const ResponseCodes = require('../utils/responseCode');
const userService = require('../services/userService');

const response = new ResponseCodes();
const serverStatus = response.serverError().status;
const successStatus = response.success().status;

const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers();

    if (result.success) {
      response.message = 'Users list fetched successfully!';
      response.data = result.data;
      return res.status(successStatus).send(response.success());
    } else {
      response.message = 'Something went wrong - Please try again.';
      response.error = result.error;
      return res.status(serverStatus).send(response.serverError());
    }
  } catch (error) {
    response.message = 'Unexpected error occurred.';
    response.error = error.message;
    return res.status(serverStatus).send(response.serverError());
  }
};

module.exports = {
  getUsers
};
