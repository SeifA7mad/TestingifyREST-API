const {
  generateRandomInt,
  generateNominalValue,
  generateMutatedValue,
  generateViolationValue,
  isFinite,
} = require('../generate-values');

const Genome = require('../classes/Genome');

exports.changeFiniteValue = (genomes) => {
  // copy the genomes to edit it later
  const newGenomes = [...genomes];

  // map only finite values (isFinite = true) then filter the undefined values keeping only the indexes of finite genomes
  const finiteValuesIndex = genomes
    .map((input, index) => (input.isFinite ? index : undefined))
    .filter((input) => input !== undefined);

  // if no finite genomes => null
  if (finiteValuesIndex.length <= 0) {
    return null;
  }

  // choose a rendom finite input to change it value
  const randomFiniteValueIndex =
    finiteValuesIndex[generateRandomInt(finiteValuesIndex.length - 1)];
  const randomGene = genomes[randomFiniteValueIndex];

  // if the radnom choosen finite input == enum => change the input value to another value from the enum (distict from old value)
  // if the radnom choosen finite input == boolen => change true to false and vice-versa
  if (randomGene && randomGene.schema.enum) {
    const enumValues = randomGene.schema.enum.filter(
      (value) => value !== randomGene.value
    );
    newGenomes[randomFiniteValueIndex].value =
      enumValues[generateRandomInt(enumValues.length)];
  } else if (randomGene.schema.type === 'boolean') {
    newGenomes[randomFiniteValueIndex].value =
      !newGenomes[randomFiniteValueIndex].value;
  }

  return newGenomes;
};

exports.addNewInput = (genomes, operationgenomes) => {
  // copy the genomes to edit it later
  const newGenomes = [...genomes];

  // map the genomes name into an array
  const usedgenomesNames = genomes.map((input) => input.name);

  // filter the opeartion genomes from the already used genomes into new array (contains unused genomes if exist)
  const newGenomesToBeAdded = operationgenomes.filter(
    (input) => !usedgenomesNames.includes(input.name.toString())
  );

  // if no new genomes to be added => null
  if (newGenomesToBeAdded.length <= 0) {
    return null;
  }

  // choose a random input from newGenomesToBeAdded to add it into genomes
  const randomNewInputChoice = generateRandomInt(newGenomesToBeAdded.length - 1);

  // add a new input object into newGenomes
  newGenomes.push(
    new Genome(
      newGenomesToBeAdded[randomNewInputChoice].name,
      newGenomesToBeAdded[randomNewInputChoice].schema,
      newGenomesToBeAdded[randomNewInputChoice].required,
      generateNominalValue(newGenomesToBeAdded[randomNewInputChoice].schema),
      isFinite(newGenomesToBeAdded[randomNewInputChoice].schema)
    )
  );

  return newGenomes;
};

exports.removeNonRequiredInput = (genomes) => {
  // copy the genomes to edit it later
  const newGenomes = [...genomes];

  // map only non-required genomes (required = false) then filter the undefined values keeping only the non-required genomes indexes
  const nonRequiredgenomesIndex = genomes
    .map((input, index) => (!input.required ? index : undefined))
    .filter((input) => input !== undefined);

  // if all the genomes is required => null
  if (nonRequiredgenomesIndex.length <= 0) {
    return null;
  }

  // choose a random non-required input index to remove it
  const randomNonRequiredInputIndex =
    nonRequiredgenomesIndex[
      generateRandomInt(nonRequiredgenomesIndex.length - 1)
    ];
  newGenomes.splice(randomNonRequiredInputIndex, 1);

  return newGenomes;
};

exports.removeRequiredInput = (genomes) => {
  // copy the genomes to edit it later
  const newGenomes = [...genomes];

  // map only non-required genomes (required = false) then filter the undefined values keeping only the non-required genomes indexes
  const requiredgenomesIndex = genomes
    .map((input, index) => (input.required ? index : undefined))
    .filter((input) => input !== undefined);

  // if all the genomes is required => null
  if (requiredgenomesIndex.length <= 0) {
    return null;
  }

  // choose a random non-required input index to remove it
  const randomRequiredInputIndex =
    requiredgenomesIndex[generateRandomInt(requiredgenomesIndex.length - 1)];
  const mutationApplied = {
    inputName: newGenomes[randomRequiredInputIndex].name,
    txt: `The mutation operation removed a required input`,
  };
  newGenomes.splice(randomRequiredInputIndex, 1);

  return { genomes: newGenomes, mutationApplied };
};

exports.mutateInputType = (genomes) => {
  // copy the genomes to edit it later
  const newGenomes = [...genomes];

  // map&filter only string or number or integer or enum genomes and save thier indexes
  const filteredgenomesIndex = genomes
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

  if (filteredgenomesIndex.length <= 0) {
    return null;
  }

  const randomFilteredInputIndex =
    filteredgenomesIndex[generateRandomInt(filteredgenomesIndex.length - 1)];

  const oldValue = newGenomes[randomFilteredInputIndex].value;

  newGenomes[randomFilteredInputIndex].value = generateMutatedValue(
    newGenomes[randomFilteredInputIndex].schema
  );

  const mutationApplied = {
    inputName: newGenomes[randomFilteredInputIndex].name,
    txt: `The mutation operation mutated the input value from "${oldValue}" to "${newGenomes[randomFilteredInputIndex].value}"`,
  };

  return { genomes: newGenomes, mutationApplied };
};

exports.constraintViolation = (genomes) => {
  // copy the genomes to edit it later
  const newGenomes = [...genomes];

  const filteredgenomesIndex = genomes
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

  if (filteredgenomesIndex.length <= 0) {
    return null;
  }

  const randomFilteredInputIndex =
    filteredgenomesIndex[generateRandomInt(filteredgenomesIndex.length - 1)];

  const oldValue = newGenomes[randomFilteredInputIndex].value;
  newGenomes[randomFilteredInputIndex].value = generateViolationValue(
    newGenomes[randomFilteredInputIndex].schema
  );

  const mutationApplied = {
    inputName: newGenomes[randomFilteredInputIndex].name,
    txt: `The mutation operation violated the input value from "${oldValue}" to "${newGenomes[randomFilteredInputIndex].value}"`,
  };

  return { genomes: newGenomes, mutationApplied };
};
