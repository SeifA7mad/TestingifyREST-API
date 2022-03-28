module.exports = class TestcaseInput {
    constructor(name, schema, required, value, isFinite) {
        this.name = name;
        this.schema = schema;
        this.required = required;
        this.value = value;
        this.isFinite = isFinite;
    }
}