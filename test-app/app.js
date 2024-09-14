require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const connectToDatabase = require('./database/connection');
const apiResponse = require('./utils/apiResponse');

const corsOptions = {
  origin: '*'
};

const app = express();
app.use(express.static(path.join(__dirname, './public')));

app.use(cors(corsOptions));
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
app.use((err, req, res, next) => {
  if (err) {
    const errorResponse = apiResponse.serverError({
      message: 'Something went wrong - Please try again.',
      error: err
    });
    return res.status(500).send(errorResponse);
  }
  next();
});

connectToDatabase();

/* This piece of code is setting up the port for the Express server to listen on. */
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
