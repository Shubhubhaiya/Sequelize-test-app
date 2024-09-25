require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const connectToDatabase = require('./database/connection');
const apiResponse = require('./utils/apiResponse');
const setupSwagger = require('./config/swagger');
const errorHandlerMiddleware = require('./middleware/errorHandler');

const corsOptions = {
  origin: '*'
};

const app = express();
app.use(express.static(path.join(__dirname, './public')));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors(corsOptions));
// Parse application/json

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
  })
);

app.use('/api', routes);

// Error handling middleware
app.use(errorHandlerMiddleware);

// Setup Swagger after the routes are defined
setupSwagger(app);

connectToDatabase();

/* This piece of code is setting up the port for the Express server to listen on. */
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
