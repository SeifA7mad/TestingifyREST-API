const { generateRandomInt } = require('../generate-values');

const {
  changeFiniteValue,
  addNewInput,
  removeInput,
} = require('./mutation-operators');

const mutationType = ['nominalTesting', 'mutationTesting'];
const inputTypes = ['parameters', 'properties'];
const nominalMutationOperator = ['changeFinite', 'addNewInput', 'removeInput'];
const errorMutationOperator = [
  'missingRequired',
  'wrongInputType',
  'constraintViolation',
];

const nominalMutation = (genome, operationInputs) => {
  const newGenome = { ...genome };

  const editableMutationOperator = [...nominalMutationOperator];
  // choose wether to mutate parameters or properties
  const inputTypeChoice = generateRandomInt(1);
  const inputType = inputTypes[inputTypeChoice];

  // choose a random nominal mutation operator ['changeFinite', 'addNewInput', 'removeInput']
  let mutationOperatorChoice;

  // loop: until there is at least one mutation operator is applied else remove the unappliable mutation operator from choices
  loop: while (editableMutationOperator.length > 0) {
    mutationOperatorChoice = generateRandomInt(
      editableMutationOperator.length - 1
    );

    // first: mutation operator => change a finite value to another value
    if (nominalMutationOperator[mutationOperatorChoice] === 'changeFinite') {
      const newInputs = changeFiniteValue(genome[inputType]);
      if (!newInputs) {
        editableMutationOperator.splice(
          editableMutationOperator.indexOf('changeFinite'),
          1
        );
        continue loop;
        // return newGenome;
      }
      newGenome[inputType] = newInputs;
      return newGenome;
    }

    // second: mutation operator => add new input either to parameters or to properties (new input must be distict)
    if (nominalMutationOperator[mutationOperatorChoice] === 'addNewInput') {
      const newInputs = addNewInput(
        genome[inputType],
        inputType === 'properties' && operation.requestBody
          ? operation.requestBody.properties
          : inputType === 'parameters'
          ? operation.parameters
          : []
      );

      if (!newInputs) {
        editableMutationOperator.splice(
          editableMutationOperator.indexOf('addNewInput'),
          1
        );
        continue loop;
        // return newGenome;
      }

      newGenome[inputType] = newInputs;

      return newGenome;
    }

    // third: mutation operator => remove a non required input
    if (nominalMutationOperator[mutationOperatorChoice] === 'removeInput') {
      const newInputs = removeInput(genome[inputType]);

      if (!newInputs) {
        editableMutationOperator.splice(
          editableMutationOperator.indexOf('removeInput'),
          1
        );
        continue loop;
        // return newGenome;
      }
      newGenome[inputType] = newInputs;
      return newGenome;
    }
  }

  return newGenome;
};

const errorMutation = (genome, operationInputs) => {};

exports.mutation = (chromosome, routeObj, MR = 0.5) => {
  const newChromosome = chromosome;
  let mutationTypeChoice;

  // loop on every Genome in the Test Case chromosome
  for (let i = 0; i < chromosome.length; i++) {
    // if random number > MR (mutation rate) => ignore (exclude) this Genome from mutation
    if (Math.random() > MR) {
      continue;
    }

    // choose random mutation type => (nominal testing or mutation testing)
    mutationTypeChoice = generateRandomInt(mutationType.length - 1);

    // if mutation type == 'nominal testing' the test case (chromosome) must be of type nominal to be able to perform nominal mutation
    if (
      (mutationType[mutationTypeChoice] === 'nominalTesting' &&
        chromosome[i].testingType === 'nominal') ||
      true
    ) {
      newChromosome[i] = nominalMutation(
        chromosome[i],
        routeObj[chromosome[i].operation]
      );
    } else {
      //   newChromosome[i] = errorMutation(
      //     chromosome[i],
      //     routeObj[chromosome[i].operation].inputs
      //   );
    }
  }

  return newChromosome;
};
