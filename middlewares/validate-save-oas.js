const fs = require('fs');
const path = require('path');
const SwaggerParser = require('@apidevtools/swagger-parser');

exports.saveOasToFile = (req, res, next) => {
  if (!req.file) {
    const dir = path.join(process.cwd(), `/data/${req.file.originalname}`);
    try {
      fs.writeFileSync(dir, JSON.stringify(req.body));
      req.workingFilePath = dir;
    } catch (err) {
      next(err);
    }
  } else {
    req.workingFilePath = req.file.path;
  }
  console.log('File SAVED!');
  next();
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

    // console.log(securityMap);
    req.requiredSecurityInfo = securityMap;
    req.server = oas.servers[0].url; 
    next();
  } catch (err) {
    next(err);
  }
};
