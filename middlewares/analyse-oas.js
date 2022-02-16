const fs = require('fs');
const path = require('path');
const axios = require('axios');
const SwaggerParser = require('@apidevtools/swagger-parser');

exports.saveOasToFile = (req, res, next) => {
  const fileName = `${req.body.info.title}`.trim().split(' ').join('');
  const dir = path.join(process.cwd(), `/data/${fileName}.json`);

  try {
    fs.writeFileSync(dir, JSON.stringify(req.body));
    console.log('File SAVED!');
    req.workingFilePath = dir;
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.validateAccessToApi = async (req, res, next) => {
  try {
    const oas = await SwaggerParser.bundle(req.workingFilePath);

    //loop on each server to catch an working one
    // oas.servers.forEach(async (server) => {
    //   try {
    //     const response = await axios(
    //       `${server.url}weather?q=London&appid=53f9205b25dcd994f69d550835e47081`
    //     );
    //     console.log(response.status);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });

    const requiredSecurity = oas.components.securitySchemes;
    const securityMap = new Map();

    // loop on security schemas to validate access to the API
    for (let key in requiredSecurity) {
      if (requiredSecurity[key].type.toString().toLowerCase() === 'apikey') {
        if (!req.query.apikey) {
          const error = new Error('unAuthorized, API-KEY required.');
          error.statusCode = 401;
          throw error;
        }
        securityMap.set('apikey', {
          value: req.query.apikey,
          name: requiredSecurity[key].name,
          in: requiredSecurity[key].in,
        });
      } else if (
        requiredSecurity[key].type.toString().toLowerCase() === 'http' &&
        requiredSecurity[key].schema.toString().toLowerCase() === 'bearer'
      ) {
        if (!req.query.jwt) {
          const error = new Error('unAuthorized, JWT token required.');
          error.statusCode = 401;
          throw error;
        }
        securityMap.set('jwt', {
          value: req.query.jwt,
          name: 'Authorization',
          in: 'header',
        });
      }
    }
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
