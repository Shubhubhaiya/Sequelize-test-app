const { sequelize } = require('./models');

function connectToDatabase() {
  return sequelize
    .authenticate()
    .then(() => console.log('Db Connection has been successfully established.'))
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
      // Optionally implement retry logic or emit an event here
    });
}

module.exports = connectToDatabase;
