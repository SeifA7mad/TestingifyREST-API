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
  header: {
    simple: ['{p}', '{p*}'],
  },
};

const dictionary = {};

const generateValue = (typeSchema) => {
  if (typeSchema.example || typeSchema.default || typeSchema.enum) {
    const values = [typeSchema.example, typeSchema.default, typeSchema.enum ? typeSchema.enum[0] : undefined];
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

const transformRoute = (route, pathName) => {
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

      const paramName =
        param.name !== 'id'
          ? param.name
          : route.operationId
          ? `${route.operationId}${param.name}`
          : `${pathName}${param.name}`;

      const paramObj = {
        name: paramName,
        in: param.in,
        required: param.required ? param.required : false,
        style: param.style
          ? stylesTemplate[param.in][param.style][explode]
          : stylesTemplate[param.in][defaultStyles[param.in]][explode],
      };

      if (!dictionary[paramName]) {
        dictionary[paramName] = {
          schema: param.schema,
          value: param.example ? param.example : generateValue(param.schema),
        };
      }
      transformedRoute['inputs'].parameters.push(paramObj);
    });
    // console.log(transformedRoute['inputs'].parameters);
  }

  if (route.requestBody) {
    const bodyContent = route.requestBody.content['application/json'];
    // concern: if no examples -> loop on the properties + add it it in the dictionry if not already added
    const bodyObj = {
      schema: bodyContent.schema,
      required: route.requestBody.required ? route.requestBody.required : false,
      examples: route.requestBody.examples ? route.requestBody.examples : null,
    };

    for (let prop in bodyContent.schema.properties) {
      const propName =
        prop !== 'id'
          ? prop
          : route.operationId
          ? `${route.operationId}${prop}`
          : `${pathName}${prop}`;

      if (!dictionary[propName]) {
        dictionary[propName] = {
          schema: bodyContent.schema.properties[prop],
          value: generateValue(bodyContent.schema.properties[prop]),
        };
      }
    }
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
        routesMap[path][op] = transformRoute(
          oasPaths[path][op],
          path.split('/')[1].toLocaleLowerCase()
        );
      }
    }
    // .post['/meals'].inputs.requestBody[0].content
    // .get['/meals'].inputs.parameters[0].jsonSchema
    //.get['/maps/api/elevation/json'].inputs.parameters
    // ['/meals/{id}']['delete'].inputs.parameters
    // console.log(routesMap['/meals']['get'].inputs.parameters);
    // routesMap['/meals']['get'].outputs
    // routesMap['/meals']['post'].inputs.requestBody
    console.log(dictionary);
    next();
  } catch (err) {
    next(err);
  }
};
