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
      typeSchema.maximum ? typeSchema.maximum : 0,
      typeSchema.minimum ? typeSchema.minimum : 0
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
  return '';
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
}

module.exports = {
  generateNominalValue,
  generateMutatedValue,
  generateRandomInt,
  extractNumberOfPossiableValues,
  isFinite,
};
