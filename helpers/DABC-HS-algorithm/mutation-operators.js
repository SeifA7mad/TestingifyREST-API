const {
  generateRandomInt,
  generateNominalValue,
  generateMutatedValue,
  generateViolationValue,
  isFinite,
} = require('../generate-values');

const TestcaseInput = require('../classes/TestcaseInput');

exports.changeFiniteValue = (inputs) => {
  // copy the inputs to edit it later
  const newInputs = [...inputs];

  // map only finite values (isFinite = true) then filter the undefined values keeping only the indexes of finite inputs
  const finiteValuesIndex = inputs
    .map((input, index) => (input.isFinite ? index : undefined))
    .filter((input) => input !== undefined);

  // if no finite inputs => null
  if (finiteValuesIndex.length <= 0) {
    return null;
  }

  // choose a rendom finite input to change it value
  const randomFiniteValueIndex =
    finiteValuesIndex[generateRandomInt(finiteValuesIndex.length - 1)];
  const randomGene = inputs[randomFiniteValueIndex];

  // if the radnom choosen finite input == enum => change the input value to another value from the enum (distict from old value)
  // if the radnom choosen finite input == boolen => change true to false and vice-versa
  if (randomGene && randomGene.schema.enum) {
    const enumValues = randomGene.schema.enum.filter(
      (value) => value !== randomGene.value
    );
    newInputs[randomFiniteValueIndex].value =
      enumValues[generateRandomInt(enumValues.length)];
  } else if (randomGene.schema.type === 'boolean') {
    newInputs[randomFiniteValueIndex].value =
      !newInputs[randomFiniteValueIndex].value;
  }

  return newInputs;
};

exports.addNewInput = (inputs, operationInputs) => {
  // copy the inputs to edit it later
  const newInputs = [...inputs];

  // map the inputs name into an array
  const usedInputsNames = inputs.map((input) => input.name);

  // filter the opeartion inputs from the already used inputs into new array (contains unused inputs if exist)
  const newInputsToBeAdded = operationInputs.filter(
    (input) => !usedInputsNames.includes(input.name.toString())
  );

  // if no new inputs to be added => null
  if (newInputsToBeAdded.length <= 0) {
    return null;
  }

  // choose a random input from newInputsToBeAdded to add it into inputs
  const randomNewInputChoice = generateRandomInt(newInputsToBeAdded.length - 1);

  // add a new input object into newInputs
  newInputs.push(
    new TestcaseInput(
      newInputsToBeAdded[randomNewInputChoice].name,
      newInputsToBeAdded[randomNewInputChoice].schema,
      newInputsToBeAdded[randomNewInputChoice].required,
      generateNominalValue(newInputsToBeAdded[randomNewInputChoice].schema),
      isFinite(newInputsToBeAdded[randomNewInputChoice].schema)
    )
  );

  return newInputs;
};

exports.removeNonRequiredInput = (inputs) => {
  // copy the inputs to edit it later
  const newInputs = [...inputs];

  // map only non-required inputs (required = false) then filter the undefined values keeping only the non-required inputs indexes
  const nonRequiredInputsIndex = inputs
    .map((input, index) => (!input.required ? index : undefined))
    .filter((input) => input !== undefined);

  // if all the inputs is required => null
  if (nonRequiredInputsIndex.length <= 0) {
    return null;
  }

  // choose a random non-required input index to remove it
  const randomNonRequiredInputIndex =
    nonRequiredInputsIndex[
      generateRandomInt(nonRequiredInputsIndex.length - 1)
    ];
  newInputs.splice(randomNonRequiredInputIndex, 1);

  return newInputs;
};

exports.removeRequiredInput = (inputs) => {
  // copy the inputs to edit it later
  const newInputs = [...inputs];

  // map only non-required inputs (required = false) then filter the undefined values keeping only the non-required inputs indexes
  const requiredInputsIndex = inputs
    .map((input, index) => (input.required ? index : undefined))
    .filter((input) => input !== undefined);

  // if all the inputs is required => null
  if (requiredInputsIndex.length <= 0) {
    return null;
  }

  // choose a random non-required input index to remove it
  const randomRequiredInputIndex =
    requiredInputsIndex[generateRandomInt(requiredInputsIndex.length - 1)];
  const mutationApplied = `The mutation operation removed a required input: (${newInputs[randomRequiredInputIndex].name})`;
  newInputs.splice(randomRequiredInputIndex, 1);

  return { inputs: newInputs, mutationApplied };
};

exports.mutateInputType = (inputs) => {
  // copy the inputs to edit it later
  const newInputs = [...inputs];

  // map&filter only string or number or integer or enum inputs and save thier indexes
  const filteredInputsIndex = inputs
    .map((input, index) => {
      if (
        input.schema.type === 'string' ||
        input.schema.type === 'number' ||
        input.schema.type === 'integer' ||
        input.schema.enum
      ) {
        return index;
      }
      return undefined;
    })
    .filter((input) => input !== undefined);

  if (filteredInputsIndex.length <= 0) {
    return null;
  }

  const randomFilteredInputIndex =
    filteredInputsIndex[generateRandomInt(filteredInputsIndex.length - 1)];

  const oldValue = newInputs[randomFilteredInputIndex].value;

  newInputs[randomFilteredInputIndex].value = generateMutatedValue(
    newInputs[randomFilteredInputIndex].schema
  );

  const mutationApplied = `The mutation operation mutated the input (${newInputs[randomFilteredInputIndex].name}) value from "${oldValue}" to "${newInputs[randomFilteredInputIndex].value}"`;

  return { inputs: newInputs, mutationApplied };
};

exports.constraintViolation = (inputs) => {
  // copy the inputs to edit it later
  const newInputs = [...inputs];

  const filteredInputsIndex = inputs
    .map((input, index) => {
      if (
        input.schema.minLength ||
        input.schema.maxLength ||
        input.schema.maximum ||
        input.schema.minimum
      ) {
        return index;
      }
      return undefined;
    })
    .filter((input) => input !== undefined);

  if (filteredInputsIndex.length <= 0) {
    return null;
  }

  const randomFilteredInputIndex =
    filteredInputsIndex[generateRandomInt(filteredInputsIndex.length - 1)];

  const oldValue = newInputs[randomFilteredInputIndex].value;
  newInputs[randomFilteredInputIndex].value = generateViolationValue(
    newInputs[randomFilteredInputIndex].schema
  );

  const mutationApplied = `The mutation operation violated the input (${newInputs[randomFilteredInputIndex].name}) value from "${oldValue}" to "${newInputs[randomFilteredInputIndex].value}"`;

  return { inputs: newInputs, mutationApplied };
};
