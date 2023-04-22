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
  try {
    let reqURL = requestURL;
    const URLTemplate = parse(reqURL);

    const paramsObj = {};
    testInputs.params.forEach((param) => {
      paramsObj[param.name] = param.value;
    });
    reqURL = URLTemplate.expand(paramsObj);

    let propsObj = null;
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
        apikey = reqURL.includes('?')
          ? `&${key.name}=${key.value}`
          : `?${key.name}=${key.value}`;
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
      url: `${serverURL.slice(0, -1)}${reqURL}${apikey}`,
      data: propsObj ? propsObj : null,
      headers: securityHeaders
    };

    return axios(reqConfig);
  } catch (err) {
    throw err;
  }
};

exports.executeTestSuite = async (req, res, next) => {
  const testSuite = req.DABC_results.testSuite;
  const generalRequiredSecurity = req.requiredGeneralSecurity;
  const testingSuiteResults = {};

  for (const testSuiteRoute in testSuite) {
    const testCase = testSuite[testSuiteRoute].testCase;
    testingSuiteResults[testSuiteRoute] = [];

    for (const testRequest of testCase) {
      const params = testRequest.parameters;
      const props = testRequest.properties;
      const op = testRequest.operation;
      const testType = testRequest.testType;
      const mutationApplied = testRequest.mutationApplied;
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

      try {
        const res = await executeTestCase(
          req.server,
          requestURL,
          { params, props },
          op,
          security
        );

        testingSuiteResults[testSuiteRoute].push(
          new TestResult(
            op,
            res.request.path,
            params,
            props,
            testType,
            res.status,
            res.statusText,
            mutationApplied
          )
        );
      } catch (err) {
        console.error(
          '🚀 ~ file: execute-test-suite.js:108 ~ exports.executeTestSuite= ~ err:',
          err
        );

        if (err.response) {
          testingSuiteResults[testSuiteRoute].push(
            new TestResult(
              op,
              err.request.path,
              params,
              props,
              testType,
              err.response.status,
              err.response.statusText,
              mutationApplied
            )
          );
        }
      }
    }
  }

  req.testSuiteResults = testingSuiteResults;
  next();
};
