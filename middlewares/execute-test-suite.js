const axios = require('axios').default;
const { parse } = require('uri-template');
const TestResult = require('../helpers/classes/TestResult');

const executeTestCase = async (
  serverURL,
  requestURL,
  testInputs,
  operation,
  security
) => {
  let reqURL = requestURL;
  const URLTemplate = parse(reqURL);

  if (testInputs.params.length > 0) {
    const paramsObj = {};
    testInputs.params.forEach((param) => {
      paramsObj[param.name] = param.value;
    });
    reqURL = URLTemplate.expand(paramsObj);
  }

  const propsObj = null;
  if (testInputs.props.length > 0) {
    propsObj = {};
    testInputs.props.forEach((prop) => {
      propsObj[prop.name] = prop.value;
    });
  }

  let apikey = '';
  const securityHeaders = {};
  security.forEach((key) => {
    if (key.in === 'query') {
      apikey = `&${key.name}=${key.value}`;
    }
    if (key.in === 'header') {
      securityHeaders[key.name] = `${key.prefix}${key.value}`;
    }
    if (key.in === 'cookie') {
      securityHeaders['Cookie'] = `${key.name}=${key.value}`;
    }
  });

  const reqConfig = {
    method: operation,
    url: `${serverURL}${reqURL}${apikey}`,
    data: propsObj ? propsObj : null,
    headers: securityHeaders,
  };

  return await axios(reqConfig);
};

exports.executeTestSuite = (req, res, next) => {
  const testSuite = req.testSuite;
  const generalRequiredSecurity = req.requiredGeneralSecurity;
  const testingSuiteResults = {};

  for (const testSuiteRoute in testSuite) {
    const testCase = testSuite[testSuiteRoute].testCase;
    testingSuiteResults[testSuiteRoute] = [];

    for (const testRequest of testCase) {
      const params = testRequest.parameters;
      const props = testRequest.properties;
      const op = testRequest.operation;
      const requestURL = req.routes[testSuiteRoute][op].basicURL;
      const requiredSecurity = req.routes[testSuiteRoute][op].requiredSecurity
        ? req.routes[testSuiteRoute][op].requiredSecurity
        : generalRequiredSecurity;

      const security = [];
      if (requiredSecurity) {
        requiredSecurity.forEach((key) => {
          security.push(req.requiredSecurityInfo.get(Object.keys(key)[0]));
        });
      }

      executeTestCase(req.server, requestURL, { params, props }, op, security)
        .then((res) => {
          console.log(res);
          // testingSuiteResults[testSuiteRoute].push(new TestResult(op, ));
        })
        .catch((err) => {
          if (err.response) {
            console.log(err.response.status);
            console.log(err.response.statusText);
            console.log(testRequest.mutationApplied);
          }
        });
    }
  }
  next();
};
