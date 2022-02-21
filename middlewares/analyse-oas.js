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
      requestedBody: [],
    },
    outputs: {},
  };

  let explode = null;

  if (route.parameters) {
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
      };
      transformedRoute['inputs'].parameters.push(paramObj);
    });
    // console.log(transformedRoute['inputs'].parameters);
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
    console.log(routesMap);
    next();
  } catch (err) {
    next(err);
  }
};
