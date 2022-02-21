const SwaggerParser = require('@apidevtools/swagger-parser');

const defaultStyles = {
  query: 'form',
  cookie: 'form',
  path: 'simple',
  header: 'simple',
};

const stylesTemplate = {
  path: {
    simple: ['{p}', '{p*}'],
    label: ['{.p}', '{.p*}'],
    matrix: ['{;p}', '{;p*}'],
  },
  query: {
    form: ['p', 'p*'],
    spaceDelimited: ['%20', 'p*'],
    pipeDelimited: ['|', 'p*'],
  },
};

const transformRoute = (route) => {
  const transformedRoute = {
    inputs: {
      parameters: [],
      requestBody: [],
    },
    outputs: {},
  };

  // loop on parameters obj (if exist)
  if (route.parameters) {
    let explode = null;
    route.parameters.forEach((param) => {
      // no explode -> default = false (exception style 'form' default = true)
      explode = param.explode
        ? +param.explode
        : !param.style || param.style === 'form'
        ? +true
        : +false;

      const paramObj = {
        name: param.name,
        in: param.in,
        required: param.required ? param.required : false,
        style: param.style
          ? stylesTemplate[param.in][param.style][explode]
          : stylesTemplate[param.in][defaultStyles[param.in]][explode],
        jsonSchema: param.schema,
        value: null,
      };
      transformedRoute['inputs'].parameters.push(paramObj);
    });
    // console.log(transformedRoute['inputs'].parameters);
  }

  if (route.requestBody) {
    const bodyContent = route.requestBody.content['application/json'];

    const bodyObj = {
      jsonSchema: bodyContent.schema,
      required: route.requestBody.required ? route.requestBody.required : false,
      value: null,
    };
    transformedRoute['inputs'].requestBody.push(bodyObj);
  }
  return transformedRoute;
};

exports.transformRoutes = async (req, res, next) => {
  const routesMap = {
    get: {},
    post: {},
    put: {},
    patch: {},
    delete: {},
  };

  try {
    const oas = await SwaggerParser.dereference(req.workingFilePath);
    const oasPaths = oas.paths;

    // later: work on file streams (chunks) instead of looping on whole file
    // if big --> split to chunks and work parallel on each chunck
    for (let path in oasPaths) {
      for (let op in oasPaths[path]) {
        routesMap[op.toString().toLowerCase()][path] = transformRoute(
          oasPaths[path][op]
        );
      }
    }
    // .post['/meals'].inputs.requestBody[0].content
    // .get['/meals'].inputs.parameters[0].jsonSchema
    console.log(routesMap);
    next();
  } catch (err) {
    next(err);
  }
};
