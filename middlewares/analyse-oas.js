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

const generateValue = (typeSchema, namePrefix = '') => {
  if (
    typeSchema.example ||
    typeSchema.default ||
    typeSchema.enum ||
    typeSchema.items
  ) {
    const values = [
      typeSchema.example,
      typeSchema.default,
      typeSchema.enum ? typeSchema.enum[0] : undefined,
      typeSchema.items
        ? [generateValue(typeSchema.items, namePrefix)]
        : undefined,
    ];
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

  if (typeSchema.type === 'object') {
    const obj = {};
    let propName;

    for (let prop in typeSchema.properties) {
      propName = prop !== 'id' ? prop : `${namePrefix}${prop}`;

      if (!dictionary[propName]) {
        dictionary[propName] = {
          schema: typeSchema.properties[prop],
          value: typeSchema.properties[prop].example
            ? typeSchema.properties[prop].example
            : generateValue(typeSchema.properties[prop], namePrefix),
        };
      }

      obj[propName] = dictionary[propName].value;
    }
    return obj;
  }
  return '';
};

const transformRoute = (route, pathName) => {
  const transformedRoute = {
    inputs: {
      parameters: [],
      requestBody: [],
    },
    outputs: {},
  };

  // input: parameters
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

      // check to see if param name is not specified exactly ex: id
      // if not use the original name
      // if it use the operationId + param name if exixst <--> if not exist use the path name + param name
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

      // add paramter (schema, value) to the dictionry if not already exist
      if (!dictionary[paramName]) {
        dictionary[paramName] = {
          schema: param.schema,
          value: param.example
            ? param.example
            : generateValue(
                param.schema,
                route.operationId ? route.operationId : pathName
              ),
        };
      }
      transformedRoute['inputs'].parameters.push(paramObj);
    });
    // console.log(transformedRoute['inputs'].parameters);
  }

  // input: body content
  if (route.requestBody) {
    const bodyContent = route.requestBody.content['application/json'];

    const bodyObj = {
      schema: bodyContent.schema,
      required: route.requestBody.required ? route.requestBody.required : false,
      examples: route.requestBody.examples ? route.requestBody.examples : null,
    };

    generateValue(
      bodyContent.schema,
      route.operationId ? route.operationId : pathName
    );

    // loop: on body request properties
    // for (let prop in bodyContent.schema.properties) {
    //   const propName =
    //     prop !== 'id'
    //       ? prop
    //       : route.operationId
    //       ? `${route.operationId}${prop}`
    //       : `${pathName}${prop}`;

    //   if (!dictionary[propName]) {
    //     dictionary[propName] = {
    //       schema: bodyContent.schema.properties[prop],
    //       value: bodyContent.schema.properties[prop].example
    //         ? bodyContent.schema.properties[prop].example
    //         : generateValue(
    //             bodyContent.schema.properties[prop],
    //             route.operationId ? route.operationId : pathName
    //           ),
    //     };
    //   }
    // }
    transformedRoute['inputs'].requestBody.push(bodyObj);
  }

  // output: responses
  if (route.responses) {
    for (let res in route.responses) {
      transformedRoute.outputs[res] = route.responses[res];
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
