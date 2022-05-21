module.exports = class TestResult {
  constructor(
    operation,
    url,
    params,
    props,
    testType,
    resStatusCode,
    resStatusText,
    mutationApplied
  ) {
    this.operation = operation;
    this.url = url;
    this.params = params;
    this.props = props;
    this.testType = testType;
    this.expectedStatusCode = testType === 'mutation' ? 400 : 200;
    this.actualStatusCode = resStatusCode;
    this.statusTest = resStatusText;
    this.mutationApplied = mutationApplied;
    this.passed =
      this.actualStatusCode >= this.expectedStatusCode &&
      this.actualStatusCode < (this.expectedStatusCode === 200 ? 300 : 600);
  }
};
