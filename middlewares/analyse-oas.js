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
    //     console.log('1');
    //     const response = await axios.head(server.url);
    //     console.log('response');
    //   } catch (err) {
    //     console.log(err.response.status);
    //     if (err.statusCode != '404' || err.statusCode < 500) {
    //       req.apiServer = server.url;
    //     }
    //   }
    // });

    const requiredSecurity = oas.components.securitySchemes;
    const securityMap = new Map();

    // loop on security schemas to validate&assure access to the API
    for (let key in requiredSecurity) {
      if (Object.keys(req.query).length === 0) {
        const error = new Error(
          `unauthorized, secuirty info: ${requiredSecurity[key].type} required.`
        );
        error.statusCode = 401;
        throw error;
      }
      securityMap.set(key, {
        value: req.query[requiredSecurity[key].type.toString().toLowerCase()],
        in: requiredSecurity[key].in ? requiredSecurity[key].in : 'header',
        name: requiredSecurity[key].name
          ? requiredSecurity[key].name
          : 'Authorization',
      });
    }
    req.requiredSecurityInfo = securityMap;
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
