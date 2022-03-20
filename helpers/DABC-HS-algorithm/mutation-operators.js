const {
  generateRandomInt,
  generateNominalValue,
  isFinite,
} = require('../generate-values');

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
  const randomNewInputChoice = generateRandomInt(newInputs.length - 1);

  // add a new input object into newInputs
  newInputs.push({
    name: newInputsToBeAdded[randomNewInputChoice].name,
    schema: newInputsToBeAdded[randomNewInputChoice].schema,
    value: generateNominalValue(
      newInputsToBeAdded[randomNewInputChoice].schema
    ),
    isFinite: isFinite(newInputsToBeAdded[randomNewInputChoice].schema),
  });

  return newInputs;
};

exports.removeInput = (inputs) => {
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
  const randomnonRequiredInputIndex =
    nonRequiredInputsIndex[
      generateRandomInt(nonRequiredInputsIndex.length - 1)
    ];
  newInputs.splice(randomnonRequiredInputIndex, 1);

  return newInputs;
};
