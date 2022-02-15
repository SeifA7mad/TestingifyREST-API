const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');

const testapiRouter = require('./routes/testapi');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(testapiRouter);

const serverPort = process.env.SERVER_PORT;

app.listen(serverPort, () => {
  console.log(`SERVER IS RUNNING ON PORT ${serverPort}`);
  // SwaggerParser.dereference('data-sets/open-weathermap-api.json', (err, api) => {
  //     if (err) {
  //       return console.log('ERROR');
  //     }

  //     console.log(api.paths);
  // });
});
