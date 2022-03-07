const SwaggerParser = require('@apidevtools/swagger-parser');

const { generateValue } = require('../helpers/generate-values');
const {
  getPropertyName,
  extractPathName,
} = require('../helpers/transform-names');

const defaultStyles = {
  query: 'form',
  cookie: 'form',
  path: 'simple',
  header: 'simple',
};

const stylesTemplate = {
  path: {
    simple: ['p', 'p*'],
    label: ['.p', '.p*'],
    matrix: [';p', ';p*'],
  },
  query: {
    form: ['p', 'p*'],
    spaceDelimited: ['p', 'p*'],
    pipeDelimited: ['p', 'p*'],
  },
  header: {
    simple: ['{p}', '{p*}'],
  },
};

const transformRoute = (route, path) => {
  const pathName = extractPathName(path);
  const prefixingValue = route.operationId ? route.operationId : pathName;

  const transformedRoute = {
    inputs: {
      parameters: [],
      requestBody: [],
    },
    outputs: {},
    prefixingValue: prefixingValue,
    basicUri: path.toString(),
  };

  // input: parameters
  // loop on parameters obj (if exist)
  if (route.parameters) {
    let explode = null;
    let style = null;
    let queryUri = '';

    // loop on each parameter
    route.parameters.forEach((param) => {
      // no explode -> default = false (exception style 'form' default = true)
      // explode =
      //   param.explode !== undefined
      //     ? +param.explode
      //     : !param.style || param.style === 'form'
      //     ? +true
      //     : +false;
      explode = param.explode !== undefined ? +param.explode : +false;
      style = param.style
        ? stylesTemplate[param.in][param.style][explode]
        : stylesTemplate[param.in][defaultStyles[param.in]][explode];

      // check to see if param name is not specified exactly ex: id
      // if not use the original name
      // if it's use the operationId + param name if exixst <--> if not exist use the extracted path name + param name
      const paramName = getPropertyName(param.name, prefixingValue);

      const paramObj = {
        name: param.name,
        in: param.in,
        required: param.required ? param.required : false,
      };

      // add paramter (schema, value) to the dictionry if not already exist
      if (!dictionary[paramName]) {
        dictionary[paramName] = {
          schema: param.schema,
          value: param.example
            ? param.example
            : generateValue(param.schema, prefixingValue),
        };
      }

      // add the param to the URI String (queryUri) --> if param of type query
      // replace the param in the basicUri with the new param style --> if param of type path
      if (param.in === 'query') {
        queryUri = `${queryUri}${style.replace('p', paramObj.name)},`;
      } else if (param.in === 'path') {
        transformedRoute.basicUri = transformedRoute.basicUri.replace(
          paramObj.name,
          style.replace('p', paramObj.name)
        );
      }

      transformedRoute['inputs'].parameters.push(paramObj);
    });

    if (queryUri !== '') {
      queryUri = `{?${queryUri.slice(0, -1)}}`;
      transformedRoute.basicUri += queryUri;
    }
  }

  // input: body content
  if (route.requestBody) {
    const type = Object.keys(route.requestBody.content)[0];
    const bodyContent = route.requestBody.content[type];

    const bodyObj = {
      bodyType: type,
      properties: [...Object.keys(bodyContent.schema.properties)],
      schema: bodyContent.schema,
      required: route.requestBody.required ? route.requestBody.required : false,
      example: generateValue(bodyContent.schema, prefixingValue),
    };

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
  const routesMap = {};

  try {
    const oas = await SwaggerParser.dereference(req.workingFilePath);
    const oasPaths = oas.paths;

    // later: work on file streams (chunks) instead of looping on whole file
    // if big --> split to chunks and work parallel on each chunck
    for (let path in oasPaths) {
      routesMap[path] = {};
      for (let op in oasPaths[path]) {
        routesMap[path][op] = transformRoute(oasPaths[path][op], path);
      }
    }

    // .post['/meals'].inputs.requestBody[0].content
    // .get['/meals'].inputs.parameters[0].jsonSchema
    // ['/maps/api/elevation/json']['get'].inputs.parameters
    // ['/meals/{id}']['delete'].inputs.parameters
    // console.log(routesMap['/meals']['get'].inputs.parameters);
    // routesMap['/meals']['get'].outputs
    // routesMap['/meals']['post'].inputs.requestBody
    // routesMap['/weather'].get.inputs
    // console.log(routesMap[Object.keys(routesMap)[0]]);

    req.routes = routesMap;

    next();
  } catch (err) {
    next(err);
  }
};
