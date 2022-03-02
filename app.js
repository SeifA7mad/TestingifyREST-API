const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const testapiRouter = require('./routes/testapi');

const app = express();

app.use((req, res, next) => {
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  global.dictionary = {};
  next();
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/json' ||
    file.mimetype === 'text/x-yaml'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('oasFile')
);

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.workingFilePath) {
    fs.unlink(req.workingFilePath, (err) => {
      err ? console.log(err) : null;
    });
  }
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  res.status(err.statusCode).send({ error: err.message || 'Something broke!' });
});

const serverPort = process.env.SERVER_PORT;

app.listen(serverPort, () => {
  console.log(`SERVER IS RUNNING ON PORT ${serverPort}`);
});
