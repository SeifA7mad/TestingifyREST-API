const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');

const SwaggerParser = require('@apidevtools/swagger-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

const serverPort = process.env.SERVER_PORT;

app.listen(serverPort, () => {
  console.log(`SERVER IS RUNNING ON PORT ${serverPort}`);
  SwaggerParser.dereference('data-sets/pet-store-api.json', (err, api) => {
      if (err) {
        return console.log('ERROR');
      }

      console.log(api.paths['/pets'].post.parameters[0].schema);
  })
});
