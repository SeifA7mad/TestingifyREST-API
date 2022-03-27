const { generateRandomInt } = require('../generate-values');

const {
  changeFiniteValue,
  addNewInput,
  removeNonRequiredInput,
  removeRequiredInput,
  mutateInputType,
} = require('./mutation-operators');

const mutationType = ['nominalTesting', 'mutationTesting'];
const inputTypes = ['parameters', 'properties'];
const nominalMutationOperator = ['changeFinite', 'addNewInput', 'removeInput'];
const errorMutationOperator = [
  'missingRequired',
  'wrongInputType',
  'constraintViolation',
];

const nominalMutation = (genome, operationInputs, inputType) => {
  const newGenome = { ...genome };

  const editableMutationOperator = [...nominalMutationOperator];

  // choose a random nominal mutation operator ['changeFinite', 'addNewInput', 'removeInput']
  let mutationOP;

  // loop: until there is at least one mutation operator is applied else remove the unappliable mutation operator from choices
  while (editableMutationOperator.length > 0) {
    mutationOP =
      editableMutationOperator[
        generateRandomInt(editableMutationOperator.length - 1)
      ];

    // if mutationOP === 'changeFinite' =(first: mutation operator)> change a finite value to another value
    // if mutationOP === 'addNewInput' =(second: mutation operator)> add new input either to parameters or to properties (new input must be distict)
    // if mutationOP === 'removeInput' =(third: mutation operator)> remove a random non required input
    const newInputs =
      mutationOP === 'changeFinite'
        ? changeFiniteValue(genome[inputType])
        : mutationOP === 'addNewInput'
        ? addNewInput(genome[inputType], operationInputs)
        : removeNonRequiredInput(genome[inputType]);
    if (!newInputs) {
      editableMutationOperator.splice(
        editableMutationOperator.indexOf(mutationOP),
        1
      );
      continue;
    }
    newGenome[inputType] = newInputs;
    return newGenome;
  }

  return newGenome;
};

const errorMutation = (genome, inputType) => {
  const newGenome = { ...genome };

  const editableMutationOperator = [...errorMutationOperator];

  while (editableMutationOperator.length > 0) {
    mutationOP =
      editableMutationOperator[
        generateRandomInt(editableMutationOperator.length - 1)
      ];

    // if mutationOP === 'missingRequired' =(first: mutation operator)> remove a random required input
    // if mutationOP === 'wrongInputType' =(second: mutation operator)>
    // if mutationOP === 'constraintViolation' =(third: mutation operator)> remove a non required input
    const newInputs =
      mutationOP === 'missingRequired'
        ? removeRequiredInput(genome[inputType])
        : mutationOP === 'wrongInputType'
        ? mutateInputType(genome[inputType])
        : null;

    if (!newInputs) {
      editableMutationOperator.splice(
        editableMutationOperator.indexOf(mutationOP),
        1
      );
      continue;
    }
    newGenome[inputType] = newInputs.inputs;
    newGenome['testType'] = 'mutation';
    mutationOP === 'missingRequired'
      ? (newGenome['expectedStatuscode'] = 400)
      : (newGenome['expectedStatuscode'] = 500);

    // !newGenome['mutationApplied'] ? newGenome['mutationApplied'] = [] : null
    newGenome[
      'mutationApplied'
    ] = `${newInputs.mutationApplied} from ${inputType}`;

    return newGenome;
  }

  return newGenome;
};

exports.mutation = (chromosome, routeObj, MR = 0.5) => {
  const newChromosome = [...chromosome];
  let mutationTypeChoice;
  let inputType;
  let operationInput;

  // loop on every Genome in the Test Case chromosome
  for (let i = 0; i < chromosome.length; i++) {
    // if random number > MR (mutation rate) => ignore (exclude) this Genome from mutation
    if (Math.random() > MR) {
      continue;
    }

    // choose random mutation type => (nominal testing or mutation testing)
    mutationTypeChoice = generateRandomInt(mutationType.length - 1);

    // choose wether to mutate parameters or properties
    // if the original operation contains params & props => choose random one to work on
    // only params => choose params (by default)
    // only props => choose props (by default)
    // routeObj[chromosome[i].operation] =(standsfor)> access the current original operation from route object by the current operation name from the chromosome
    inputType =
      inputTypes[
        routeObj[chromosome[i].operation].parameters.length > 0 &&
        routeObj[chromosome[i].operation].requestBody > 0
          ? generateRandomInt(inputTypes.length - 1)
          : routeObj[chromosome[i].operation].parameters.length > 0
          ? 0
          : 1
      ];

    operationInput =
      inputType === 'properties'
        ? routeObj[chromosome[i].operation].requestBody.properties
        : routeObj[chromosome[i].operation].parameters;

    // if mutation type == 'nominal testing' the test case (chromosome) must be of type nominal to be able to perform nominal mutation
    if (
      mutationType[mutationTypeChoice] === 'nominalTesting' &&
      chromosome[i].testType === 'nominal'
    ) {
      newChromosome[i] = nominalMutation(
        chromosome[i],
        operationInput,
        inputType
      );
    } else if (
      mutationType[mutationTypeChoice] === 'mutationTesting' &&
      chromosome[i].testType === 'nominal'
    ) {
      newChromosome[i] = errorMutation(chromosome[i], inputType);
    }
  }

  return newChromosome;
};
