require('dotenv').config();
const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');

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

app.use('/api/user', require('./routes/users.routes'));

app.use((err, req, res, next) => {
  if (err) {
    responseCode.message = 'Something went wrong - Please try again.';
    responseCode.error = err;
    return res.status(serverStatus).send(responseCode.serverError());
  }
  next();
});

/* This piece of code is setting up the port for the Express server to listen on. */
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
