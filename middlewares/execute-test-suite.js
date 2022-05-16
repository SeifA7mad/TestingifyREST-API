const axios = require('axios').default;
const { parse } = require('uri-template');

const executeTestCase = async (serverURL, requestURL, testInputs, operation, security) => {
  let reqURL = requestURL;
  const URLTemplate = parse(reqURL);

  if (testInputs.params.length > 0) {
    const paramsObj = {};
    testInputs.params.forEach((param) => {
      paramsObj[param.name] = param.value;
    });
    reqURL = URLTemplate.expand(paramsObj);
  }

  const propsObj = {};
  if (testInputs.props.length > 0) {
    testInputs.props.forEach((prop) => {
      propsObj[prop.name] = prop.value;
    });
  }


  const reqConfig = {
    method: operation,
    url: serverURL + reqURL,
    data: propsObj,
    headers: {},
  };
  const res = await axios(reqConfig);
  return await res.json();
};

exports.executeTestSuite = (req, res, next) => {
  const testSuite = req.testSuite;
  const generalRequiredSecurity = req.requiredGeneralSecurity;

  for (const testSuiteRoute in testSuite) {
    const testCase = testSuite[testSuiteRoute].testCase;

    for (const testRequest of testCase) {
      const params = testRequest.parameters;
      const props = testRequest.properties;
      const op = testRequest.operation;
      const requestURL = req.routes[testSuiteRoute][op].basicURL;
      const requiredSecurity = req.routes[testSuiteRoute][op].requiredSecurity;

      executeTestCase(req.server, requestURL, { params, props }, op, {
        generalRequiredSecurity,
        requiredSecurity,
      }).then(data => { console.log(data)}).catch(err => {console.log(err)});
    }
  }
  next();
};
