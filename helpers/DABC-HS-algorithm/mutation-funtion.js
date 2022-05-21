const { generateRandomInt } = require('../generate-values');

const {
  changeFiniteValue,
  addNewInput,
  removeNonRequiredInput,
  removeRequiredInput,
  mutateInputType,
  constraintViolation,
} = require('./mutation-operators');

const Chromosome = require('../classes/Chromosome');

const mutationType = ['nominalTesting', 'mutationTesting'];
const inputTypes = ['parameters', 'properties'];
const nominalMutationOperator = ['changeFinite', 'addNewInput', 'removeInput'];
const errorMutationOperator = [
  'missingRequired',
  'wrongInputType',
  'constraintViolation',
];

const mutationStructureType = ['addChromosome', 'removeChromosome'];

const nominalMutation = (chromosome, operationInputs, inputType) => {
  const newChromosome = Object.assign(
    Object.create(Object.getPrototypeOf(chromosome)),
    chromosome
  );

  const editableMutationOperator = [...nominalMutationOperator];

  // loop: until there is at least one mutation operator is applied else remove the unappliable mutation operator from choices
  while (editableMutationOperator.length > 0) {
    // choose a random nominal mutation operator ['changeFinite', 'addNewInput', 'removeInput']
    const mutationOP =
      editableMutationOperator[
        generateRandomInt(editableMutationOperator.length - 1)
      ];

    // if mutationOP === 'changeFinite' =(first: mutation operator)> change a finite value to another value
    // if mutationOP === 'addNewInput' =(second: mutation operator)> add new input either to parameters or to properties (new input must be distict)
    // if mutationOP === 'removeInput' =(third: mutation operator)> remove a random non required input
    const newGenomes =
      mutationOP === 'changeFinite'
        ? changeFiniteValue(chromosome[inputType])
        : mutationOP === 'addNewInput'
        ? addNewInput(chromosome[inputType], operationInputs)
        : removeNonRequiredInput(chromosome[inputType]);
    if (newGenomes === null) {
      editableMutationOperator.splice(
        editableMutationOperator.indexOf(mutationOP),
        1
      );
      continue;
    }
    newChromosome[inputType] = newGenomes;
    return newChromosome;
  }

  return newChromosome;
};

const errorMutation = (chromosome, inputType) => {
  const newChromosome = Object.assign(
    Object.create(Object.getPrototypeOf(chromosome)),
    chromosome
  );

  const editableMutationOperator = [...errorMutationOperator];

  while (editableMutationOperator.length > 0) {
    const mutationOP =
      editableMutationOperator[
        generateRandomInt(editableMutationOperator.length - 1)
      ];

    // if mutationOP === 'missingRequired' =(first: mutation operator)> remove a random required input
    // if mutationOP === 'wrongInputType' =(second: mutation operator)>
    // if mutationOP === 'constraintViolation' =(third: mutation operator)>
    const newGenomes =
      mutationOP === 'missingRequired'
        ? removeRequiredInput(chromosome[inputType])
        : mutationOP === 'wrongInputType'
        ? mutateInputType(chromosome[inputType])
        : constraintViolation(chromosome[inputType]);

    if (newGenomes === null) {
      editableMutationOperator.splice(
        editableMutationOperator.indexOf(mutationOP),
        1
      );
      continue;
    }
    newChromosome[inputType] = newGenomes.genomes;
    newChromosome.testType = 'mutation';
    // mutationOP === 'missingRequired'
    //   ? (newChromosome['expectedStatuscode'] = 400)
    //   : (newChromosome['expectedStatuscode'] = 500);
    newChromosome['mutationApplied'].push(newGenomes.mutationApplied);
    return newChromosome;
  }

  return newChromosome;
};

exports.mutate = (testCase, routeObj, MR = 0.5) => {
  const newTestCase = structuredClone(testCase);

  // loop on every Chromosome in the Test Case
  for (let i = 0; i < newTestCase.length; i++) {
    // if random number > MR (mutation rate) => ignore (exclude) this chromosome from mutation
    if (Math.random() > MR) {
      continue;
    }

    // choose random mutation type => (nominal testing or mutation testing)
    const mutationTypeChoice = generateRandomInt(mutationType.length - 1);

    // choose wether to mutate parameters or properties
    // if the original operation contains params & props => choose random one to work on
    // only params => choose params (by default)
    // only props => choose props (by default)
    // routeObj[testCase[i].operation] =(standsfor)> access the current original operation from route object by the current operation name from the chromosome
    const inputType =
      inputTypes[
        routeObj[newTestCase[i].operation].parameters.length > 0 &&
        routeObj[newTestCase[i].operation].requestBody !== null
          ? generateRandomInt(inputTypes.length - 1)
          : routeObj[newTestCase[i].operation].requestBody !== null
          ? 1
          : 0
      ];

    const operationInput =
      inputType === 'properties'
        ? routeObj[newTestCase[i].operation].requestBody.properties
        : routeObj[newTestCase[i].operation].parameters;

    // if mutation type == 'nominal testing' the test case (chromosome) must be of type nominal to be able to perform nominal mutation
    if (
      mutationType[mutationTypeChoice] === 'nominalTesting' &&
      newTestCase[i].testType == 'nominal'
    ) {
      newTestCase[i] = nominalMutation(
        newTestCase[i],
        operationInput,
        inputType
      );
    } else if (
      mutationType[mutationTypeChoice] === 'mutationTesting' &&
      newTestCase[i].testType == 'nominal'
    ) {
      newTestCase[i] = errorMutation(newTestCase[i], inputType);
    }
  }

  return newTestCase;
};

exports.mutateStructure = (testCase, routeObj) => {
  const newTestCase = structuredClone(testCase);

  // choose random mutation structure type => (addChromosome or removeChromosome)
  const mutationStructureChoice = generateRandomInt(
    mutationStructureType.length - 1
  );

  if (mutationStructureType[mutationStructureChoice] === 'addChromosome') {
    const routeKeys = Object.keys(routeObj);
    const randomOperation = generateRandomInt(routeKeys.length - 1);
    newTestCase.push(
      Chromosome.generateChromosome(
        routeKeys[randomOperation],
        'nominal',
        routeObj[routeKeys[randomOperation]]
      )
    );
  } else if (
    mutationStructureType[mutationStructureChoice] === 'removeChromosome'
  ) {
    const randomChromosomeToBeRemoved = generateRandomInt(
      newTestCase.length - 1
    );
    newTestCase.splice(randomChromosomeToBeRemoved, 1);
  }

  return newTestCase;
};
