const operationsNames = {
  post: '',
  get: '',
  put: '',
  delete: '',
};

const replaceAll = (str, mapObj) => {
  var re = new RegExp(Object.keys(mapObj).join('|'), 'gi');

  return str.replace(re, (matched) => {
    return mapObj[matched.toLowerCase()];
  });
};

exports.getPropertyName = (propertyName, namePrefix = '') => {
  if (propertyName.toLocaleLowerCase() !== 'id') {
    return propertyName;
  }
  return `${replaceAll(namePrefix, operationsNames)}Id`;
};

exports.extractPathName = (pathName) => {
  let modifiedPath = pathName.split('/')[1].toLocaleLowerCase();

  return modifiedPath.charAt(modifiedPath.length - 1) === 's'
    ? modifiedPath.slice(0, -1)
    : modifiedPath;
};
