require('dotenv').config();
const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
const { sequelize } = require('./db/models');

const ResponseCodes = require('./utils/response.code');

var corsOptions = {
  origin: '*'
};

const app = express();
app.use(express.static(path.join(__dirname, './public')));

let responseCode = new ResponseCodes();
let serverStatus = responseCode.serverError().status;

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
  })
);

app.use('/api/user', require('./routes/userRoutes'));

app.use((err, req, res, next) => {
  if (err) {
    responseCode.message = 'Something went wrong - Please try again.';
    responseCode.error = err;
    return res.status(serverStatus).send(responseCode.serverError());
  }
  next();
});

sequelize
  .authenticate()
  .then(() => console.log('Connection has been successfully established.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

/* This piece of code is setting up the port for the Express server to listen on. */
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
