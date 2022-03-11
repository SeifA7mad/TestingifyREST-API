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

    if (typeSchema.minLength || typeSchema.maxLength) {
      return crypto
        .randomBytes(typeSchema.minLength || typeSchema.maxLength)
        .toString('hex');
    }

    return '';
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
    let propName;

    for (let prop in typeSchema.properties) {
      // propName = getPropertyName(
      //   prop,
      //   typeSchema.title ? typeSchema.title : namePrefix
      // );

      // if (!dictionary[propName]) {
      //   dictionary[propName] = {
      //     schema: typeSchema.properties[prop],
      //     value: typeSchema.properties[prop].example
      //       ? typeSchema.properties[prop].example
      //       : generateValue(typeSchema.properties[prop], namePrefix),
      //   };
      // }

      // obj[propName] = dictionary[propName].value;
      obj[propName] = generateNominalValue(typeSchema.properties[prop]);
    }
    return obj;
  }
  return null;
};

const generateMutatedValue = (typeSchema) => {
  return '';
};

module.exports = {
  generateNominalValue,
  generateMutatedValue,
  generateRandomInt,
};
