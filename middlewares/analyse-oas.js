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

const dictionary = {};

const generateValue = (typeSchema) => {
  if (typeSchema.example || typeSchema.default || typeSchema.enum) {
    const values = [typeSchema.example, typeSchema.default, typeSchema.enum[0]];
    return values.find((value) => value !== undefined);
  }

  if (typeSchema.type === 'number' || typeSchema.type === 'integer') {
    return typeSchema.maximum
      ? Math.floor(
          Math.random() * (typeSchema.maximum - typeSchema.minimum) +
            typeSchema.minimum
        )
      : 0;
  }

  return '';
};

const transformRoute = (route) => {
  const transformedRoute = {
    inputs: {
      parameters: [],
      requestBody: [],
    },
    outputs: [],
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
      };

      if (!dictionary[param.name]) {
        dictionary[param.name] = {
          jsonSchema: param.schema,
          value: param.example ? param.example : generateValue(param.schema),
        };
      }
      transformedRoute['inputs'].parameters.push(paramObj);
    });
    // console.log(transformedRoute['inputs'].parameters);
  }

  if (route.requestBody) {
    const bodyContent = route.requestBody.content['application/json'];
    // concern: if no examples -> loop on the properties + add it it in the dictionry if no already added
    const bodyObj = {
      jsonSchema: bodyContent.schema,
      required: route.requestBody.required ? route.requestBody.required : false,
      examples: route.requestBody.examples ? route.requestBody.examples : null
    };
    transformedRoute['inputs'].requestBody.push(bodyObj);
  }

  if (route.responses) {
    for (let res in route.responses) {
      transformedRoute.outputs.push(+res);
    }
  } 

  return transformedRoute;
};

exports.transformRoutes = async (req, res, next) => {
  // const routesMap = {
  //   get: {},
  //   post: {},
  //   put: {},
  //   patch: {},
  //   delete: {},
  // };

  const routesMap = {};

  try {
    const oas = await SwaggerParser.dereference(req.workingFilePath);
    const oasPaths = oas.paths;

    // later: work on file streams (chunks) instead of looping on whole file
    // if big --> split to chunks and work parallel on each chunck
    for (let path in oasPaths) {
      routesMap[path] = {};
      for (let op in oasPaths[path]) {
        //  routesMap[op.toString().toLowerCase()][path] = transformRoute(
        //    oasPaths[path][op]
        //  );
        routesMap[path][op] = transformRoute(oasPaths[path][op]);
      }
    }
    // .post['/meals'].inputs.requestBody[0].content
    // .get['/meals'].inputs.parameters[0].jsonSchema
    //.get['/maps/api/elevation/json'].inputs.parameters
    // ['/meals/{id}']['delete'].inputs.parameters
    // console.log(routesMap['/meals']['get'].inputs.parameters);
    // routesMap['/meals']['get'].outputs
    console.log(dictionary);
    next();
  } catch (err) {
    next(err);
  }
};
