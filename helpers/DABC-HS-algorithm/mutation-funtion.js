const {
  generateRandomInt,
  generateNominalValue,
  isFinite,
} = require('../generate-values');

const mutationType = ['nominalTesting', 'mutationTesting'];
const inputType = ['parameters', 'properties'];
const nominalMutationOperator = ['changeFinite', 'addNewInput', 'removeInput'];
const errorMutationOperator = [
  'missingRequired',
  'wrongInputType',
  'constraintViolation',
];

const nominalMutation = (genome, inputType, operationInputs) => {
  const newGenome = genome;
  let mutationOperatorChoice;
  loop: while (true) {
    mutationOperatorChoice = generateRandomInt(
      nominalMutationOperator.length - 1
    );

    // first: mutation operator => change a finite value to another value
    if (nominalMutationOperator[mutationOperatorChoice] === 'changeFinite') {
      const finiteValuesIndex = genome[inputType]
        .map((input, index) => (input.isFinite ? index : undefined))
        .filter((input) => input !== undefined);

      if (finiteValuesIndex.length <= 0) {
        continue loop;
      }

      const randomFiniteValueIndex =
        finiteValuesIndex[generateRandomInt(finiteValuesIndex.length - 1)];
      const randomGene = genome[inputType][randomFiniteValueIndex];

      if (randomGene && randomGene.schema.enum) {
        const enumValues = randomGene.schema.enum.filter(
          (value) => value !== randomGene.value
        );
        newGenome[inputType][randomFiniteValueIndex].value =
          enumValues[generateRandomInt(enumValues.length)];
      } else if (randomGene.schema.type === 'boolean') {
        newGenome[inputType][randomFiniteValueIndex].value =
          !newGenome[inputType][randomFiniteValueIndex].value;
      }

      return newGenome;
    }

    // second: mutation operator => add new input either to parameters or to properties (new input must be distict)
    if (nominalMutationOperator[mutationOperatorChoice] === 'addNewInput') {
      const usedInputsNames = genome[inputType].map((input) => input.name);
      const newInputs =
        inputType === 'parameters'
          ? operationInputs.parameters.filter(
              (param) => !usedInputsNames.includes(param.name.toString())
            )
          : operationInputs.requestBody.properties.filter(
              (prop) => !usedInputsNames.includes(prop.name.toString())
            );
      if (newInputs.length <= 0) {
        continue loop;
      }

      const randomNewInputChoice = generateRandomInt(newInputs.length - 1);
      newGenome[inputType].push({
        name: newInputs[randomNewInputChoice].name,
        schema: newInputs[randomNewInputChoice].schema,
        value: generateNominalValue(newInputs[randomNewInputChoice].schema),
        isFinite: isFinite(newInputs[randomNewInputChoice].schema),
      });

      return newGenome;
    }
  }
};

const errorMutation = (genome, operationInputs) => {};

exports.mutation = (chromosome, MR, routeObj) => {
  const newChromosome = chromosome;
  let mutationTypeChoice;
  let inputTypeChoice;

  // loop on every Genome in the Test Case chromosome
  for (let i = 0; i < chromosome.length; i++) {
    // if random number > MR (mutation rate) => ignore (exclude) this Genome from mutation
    if (Math.random() > MR) {
      continue;
    }

    // choose random mutation type => (nominal testing or mutation testing)
    mutationTypeChoice = generateRandomInt(mutationType.length - 1);

    // choose wether to mutate parameters or proporties
    chromosome[i].parameters.length > 0 && chromosome[i].properties.length > 0
      ? (inputTypeChoice = generateRandomInt(1))
      : chromosome[i].parameters.length > 0
      ? (inputTypeChoice = 0)
      : chromosome[i].properties.length > 0
      ? (inputTypeChoice = 1)
      : null;

    // if mutation type == 'nominal testing' the test case (chromosome) must be of type nominal to be able to perform nominal mutation
    if (
      mutationType[mutationTypeChoice] === 'nominalTesting' &&
      chromosome[i].testingType === 'nominal'
    ) {
      newChromosome[i] = nominalMutation(
        chromosome[i],
        inputType[inputTypeChoice],
        routeObj[chromosome[i].operation]
      );
    } else {
      //   newChromosome[i] = errorMutation(
      //     chromosome[i],
      //     inputType[inputTypeChoice],
      //     routeObj[chromosome[i].operation].inputs
      //   );
    }
  }

  return newChromosome;
};
