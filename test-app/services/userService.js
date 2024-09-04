const sampleUsers = require('../utils/userList');

class UserService {
  async getUsers() {
    try {
      // Simulate fetching users from a database or another service
      const users = sampleUsers;
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UserService();
