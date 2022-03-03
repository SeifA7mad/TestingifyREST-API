const { prefixingkey } = require('../helpers/prefixingKeys');

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
      propName = prop !== 'id' ? prop : prefixingkey(prop, namePrefix);

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

module.exports = {
  generateValue,
};
