const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

// Load YAML swagger file
const swaggerDocument = yaml.load(path.join(__dirname, 'swagger.yaml'));

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
