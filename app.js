const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

const serverPort = process.env.SERVER_PORT;

app.listen(serverPort, () =>
  console.log(`SERVER IS RUNNING ON PORT ${serverPort}`)
);
