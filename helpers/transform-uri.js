const urIParser = require('uri-template');

exports.parseUri = (basePathName, parameters) => {
  let basicUri = basePathName.toString();
  let queryUri = '';

  parameters.forEach((param) => {
    if (param.in === 'query') {
      //   if (param.style.includes('p')) {
      //     queryUri = `${queryUri}${param.style.replace('p', param.name)},`;
      //   } else {
      //       queryUri = `${queryUri}${param.name}${param.style}`;
      //   }
      queryUri = `${queryUri}${param.style.replace('p', param.name)},`;
    }

    if (param.in === 'path') {
      basicUri = basicUri.replace(
        param.name,
        param.style.replace('p', param.name)
      );
    }
  });

  if (queryUri !== '') {
    queryUri = `{?${queryUri.slice(0, -1)}}`;
    basicUri += queryUri;
  }

//    const uriTemplate = urIParser.parse(basicUri);
//    console.log(uriTemplate.expand({ q: 'London', id: '2172797', lat: '35', lon: '139' }));
  //  console.log(uriTemplate.expand({ id: '1223sd' }));

  console.log(basicUri);
  return basicUri;
};
