const crypto = require('crypto');

const generateRandomInt = (max = 0, min = 0) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateNominalValue = (typeSchema) => {
  if (typeSchema.type === 'string' && !typeSchema.enum) {
    if (typeSchema.example || typeSchema.default) {
      const values = [typeSchema.example, typeSchema.default];
      return values.find((value) => value !== undefined);
    }

    return crypto
      .randomBytes(
        typeSchema.minLength
          ? typeSchema.minLength
          : typeSchema.maxLength
          ? typeSchema.maxLength
          : 5
      )
      .toString('hex');
  }

  if (typeSchema.type === 'boolean') {
    return !!+generateRandomInt(1);
  }

  if (typeSchema.enum || typeSchema.items) {
    const values = [
      typeSchema.enum
        ? typeSchema.enum[generateRandomInt(typeSchema.enum.length - 1)]
        : undefined,
      typeSchema.items ? [generateNominalValue(typeSchema.items)] : undefined,
    ];
    return values.find((value) => value !== undefined);
  }

  if (typeSchema.type === 'number' || typeSchema.type === 'integer') {
    return generateRandomInt(
      typeSchema.maximum ? typeSchema.maximum : 1,
      typeSchema.minimum ? typeSchema.minimum : 50
    );
  }

  if (typeSchema.type === 'object') {
    const obj = {};
    for (let prop in typeSchema.properties) {
      obj[prop] = generateNominalValue(typeSchema.properties[prop]);
    }
    return obj;
  }
  return null;
};

const generateMutatedValue = (typeSchema) => {
  if (typeSchema.type === 'string' && !typeSchema.enum) {
    return generateRandomInt(50, 1);
  }

  if (
    typeSchema.type === 'number' ||
    typeSchema.type === 'integer' ||
    typeSchema.enum
  ) {
    return crypto.randomBytes(generateRandomInt(20, 5)).toString('hex');
  }
  return null;
};

const generateViolationValue = (typeSchema) => {
  if (typeSchema.type === 'string') {
    return crypto
      .randomBytes(typeSchema.maxLength + Math.pow(2, typeSchema.maxLength))
      .toString('hex');
  }

  if (typeSchema.type === 'number' || typeSchema.type === 'integer') {
    return generateRandomInt(
      typeSchema.maximum,
      typeSchema.maximum + Math.pow(2, typeSchema.minimum + 1)
    );
  }

  return null;
};

const extractNumberOfPossiableValues = (schemas) => {
  let numberOfPossiableValues = 0;
  schemas.forEach((schema) => {
    numberOfPossiableValues +=
      schema.type === 'boolean' ? 2 : schema.enum ? schema.enum.length : 0;
  });
  return numberOfPossiableValues;
};

const isFinite = (schema) => {
  return schema.type === 'boolean' || schema.enum ? true : false;
};

const extractFitnessTotalNumbers = (routeObj) => {
  const operations = Object.keys(routeObj);
  const totalNumberOfOperations = operations.length;
  let totalNumberOfInputs = 0;
  let totalNumberOfFiniteValues = 0;

  // loop to find the totalNumberOfInputs & totalNumberOfFiniteValues for every operation in this route
  operations.forEach((op) => {
    // parameters & requestBody for each operation
    const parameters = routeObj[op].parameters;
    const properties = routeObj[op].requestBody
      ? routeObj[op].requestBody.properties
      : [];

    // total number of inputs (how many parameters + how many properties in body request)
    totalNumberOfInputs += parameters.length + properties.length;

    // map the parametrs & properties schemas into arrays to use it later
    const paramsSchemas = parameters.map((param) => param.schema);
    const propSchemas = properties.map((prop) => prop.schema);

    // total number of finite values (extract the number of possiable values for finite type (boolean|enums)
    // from the two schema arrays
    totalNumberOfFiniteValues +=
      extractNumberOfPossiableValues(paramsSchemas) +
      extractNumberOfPossiableValues(propSchemas);
  });

  return {
    totalNumberOfOperations,
    totalNumberOfInputs,
    totalNumberOfFiniteValues,
  };
};

module.exports = {
  generateNominalValue,
  generateMutatedValue,
  generateRandomInt,
  extractNumberOfPossiableValues,
  generateViolationValue,
  isFinite,
  extractFitnessTotalNumbers,
};
