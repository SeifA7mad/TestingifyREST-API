module.exports = class TestResult {
    constructor(operation, url, params, props, testType, resStatusCode, mutationApplied) {
        this.operation = operation;
        this.url = url;
        this.params = params;
        this.props = props;
        this.expectedStatusCode = testType === 'nominal' ? [200] : [400, 500];
        this.actualStatusCode = resStatusCode;
        this.mutationApplied = mutationApplied;
        this.passed = this.expectedStatusCode.includes(this.expectedStatusCode);  
    }
}