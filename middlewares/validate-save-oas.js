const fs = require('fs');
const path = require('path');
const SwaggerParser = require('@apidevtools/swagger-parser');

exports.saveOasToFile = (req, res, next) => {
  // if (!req.file) {
  //   console.log(req.body);
  //   const dir = path.join(process.cwd(), `/data/${req.file.originalname}`);
  //   try {
  //     fs.writeFileSync(dir, JSON.stringify(req.body));
  //     req.workingFilePath = dir;
  //   } catch (err) {
  //     next(err);
  //   }
  // } else {
  //   req.workingFilePath = req.file.path;
  // }

  // console.log(req.file);

  req.workingFilePath = req.file.path;
  console.log('File SAVED!');
  next();
};

exports.validateAccessToApi = async (req, res, next) => {
  const authorizationProtocol = {
    apikeyauth: {
      name: '',
      in: '',
      prefix: '',
    },
    bearerauth: {
      name: 'Authorization',
      in: 'header',
      prefix: 'Bearer',
    },
    basicauth: {
      name: 'Authorization',
      in: 'header',
      prefix: 'Basic',
    },
    // OAuth2: {},
    // OpenID: {},
  };
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
    // console.log(Buffer.from("username:password").toString('base64'));
    // SGVsbG8gV29ybGQ=
    // > console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
    // Hello World

    // loop on security schemas to validate&assure access to the API
    for (let key in requiredSecurity) {
      // validate => if it's valid authorization Protocol
      if (
        !Object.keys(authorizationProtocol).includes(key.toLocaleLowerCase()) &&
        requiredSecurity[key].type !== 'apiKey'
      ) {
        const error = new Error(`unauthorized, unknown secuirty info: ${key}.`);
        error.statusCode = 401;
        throw error;
      }

      // validate => all the required authorization protocols has given values in query params
      if (
        Object.keys(req.query).length !== Object.keys(requiredSecurity).length
      ) {
        const error = new Error(
          `unauthorized, secuirty info: ${key} required.`
        );
        error.statusCode = 401;
        throw error;
      }

      const securityType = requiredSecurity[key].type;
      if (securityType === 'apiKey') {
        authorizationProtocol['apikeyauth'].in = requiredSecurity[key].in;
        authorizationProtocol['apikeyauth'].name = requiredSecurity[key].name;
      }

      securityMap.set(key, {
        ...authorizationProtocol[
          securityType === 'apiKey' ? 'apikeyauth' : key.toLowerCase()
        ],
        value: req.query[key],
      });
    }
    req.server = oas.servers[0].url;

    req.requiredSecurityInfo = securityMap;
    next();
  } catch (err) {
    next(err);
  }
};
