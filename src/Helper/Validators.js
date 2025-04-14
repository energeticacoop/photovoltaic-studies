const RangeSchemas = {
  coordinates: withCellShape(isCoordinatePair),
  tmyFileName: withCellShape(isNonEmptyString),
  selectedSelfConsumers: withMatrixShape(isBooleanMatrix),
  selfConsumersData: withMatrixShape(alwaysTrue),
  "perfilREE2.0": withColumnShape(isNumberColumn),
  "perfilREE3.0": withColumnShape(isNumberColumn),
  normalizedDates: withMatrixShape(isDateMatrix),
  recurringDaily: withColumnShape(isNumberColumn),
  recurringMonthly: withMatrixShape(isNumberMatrix),
  recurringWeekly: withMatrixShape(isNumberMatrix),
  recurringSeasonal: withMatrixShape(isNumberMatrix),
  isWeekendOrHoliday: withMatrixShape(isBooleanMatrix),
  seasons: withMatrixShape(isNumberMatrix),
  ASHPconsumption: withCellShape(isNumberCell),
  ASHPcurveName: withCellShape(isNonEmptyString),
  ashpCurvesHeaders: withMatrixShape(isNonEmptyStringMatrix),
  ASHPcurves: withMatrixShape(isNumberMatrix),
  SAVEgridUsage: withMatrixShape(isBooleanMatrix),
  SAVEseasonsKm: withMatrixShape(isNumberMatrix),
  SAVEbatteryCapacity: withCellShape(isNumberCell),
  SAVEconsumptionPer100Km: withCellShape(isNumberCell),
  maxSAVEpower: withCellShape(isNumberCell),
  saveType: withCellShape(isNonEmptyString),
  normalizedPowersOrbis: withMatrixShape(isNumberMatrix),
  normalizedPowersFronius: withMatrixShape(isNumberMatrix),
  chosenBetas: withColumnShape(isNumberColumn),
  normalizedProduction: withColumnShape(isNumberColumn),
  tariffPeriods20: withColumnShape(isNumberColumn),
  tarrifPeriods30: withColumnShape(isNumberColumn),
  tariffPeriods61: withColumnShape(isNumberColumn),
  hourlyTariff20: withColumnShape(isNumberColumn),
  hourlyTariff30: withColumnShape(isNumberColumn),
  hourlyTariff61: withColumnShape(isNumberColumn),
  fluxCoefficient: withCellShape(isNumberCell),
  monthlyEnergyTermsAfterPVwithLimitlessCompensation: withColumnShape(isNumberColumn),
  monthlyEnergyTermsAfterPVwithCompensation: withColumnShape(isNumberColumn),
  monthlyPowerCost: withColumnShape(isNumberColumn),
  monthlyRegulatedCosts: withColumnShape(isNumberColumn),
  monthlyBillBeforeFlux: withColumnShape(isNumberColumn),
  templates: withMatrixShape(alwaysTrue),
}



/**
 * Shape validators (decorator-style)
 */

function withCellShape(validatorFn) {
  return function(value) {
    if (Array.isArray(value)) {
      if (value.length === 1 && Array.isArray(value[0])) {
        value = value[0][0]
      } else {
        throw new Error("Se esperaba una celda (valor único).");
      }
    }
    return validatorFn(value);
  };
}

function withColumnShape(validatorFn) {
  return function(values) {
    if (
      !Array.isArray(values) ||
      !values.every(v => Array.isArray(v) && v.length === 1)
    ) {
      throw new Error("Se esperaba una columna (array de arrays de un solo elemento).");
    }
    const column = values.map(v => v[0]);
    return validatorFn(column);
  };
}

function withMatrixShape(validatorFn) {
  return function(matrix) {
    if (!Array.isArray(matrix) || !matrix.every(Array.isArray)) {
      throw new Error("Se esperaba una matriz (2D array).");
    }
    return validatorFn(matrix);
  };
}

/**
 * Validators (wrapped with shape checks)
 */

function isCoordinatePair(value) {
  if (
    typeof value !== "string" ||
    !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(value)
  ) {
    throw new Error("Las coordenadas deben estar en formato 'lat,lng'.");
  }
  return value
}

function isNonEmptyString(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Se esperaba una cadena de texto no vacía.");
  }
  return value
}

function isNonEmptyStringMatrix(matrix) {
  if (!matrix.every(row => row.every(val => typeof val === "string" || val.trim() === "")
  )){
      throw new Error("Todos los valores deben ser cadenas de texto no vacías.");
  }
  return matrix
}


function isBooleanMatrix(matrix) {
  if (!matrix.every(row => row.every(val => typeof val === "boolean"))) {
    throw new Error("Todos los valores deben ser booleanos.");
  }
  return matrix
}



function isNumberCell(value) {
  if (typeof value !== "number") {
    throw new Error("Se esperaba un número.")
  }
  return value
}

function isNumberColumn(column) {
  if (!column.every(val => typeof val === "number" || val === "" || val === null)){
      throw new Error("Todos los valores deben ser números.");
  }
  return column
}

function isNumberMatrix(matrix) {
  if (!matrix.every(row => row.every(val => typeof val === "number" || val === "" || val === null)
  )){
      throw new Error("Todos los valores deben ser números.");
  }
  return matrix
}



function isDateMatrix(matrix) {
  if (
    !matrix.every(row =>
      row.every(val => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      })
    )
  ) {
    throw new Error("Todos los valores deben ser fechas válidas.");
  }
  return matrix;
}

function alwaysTrue(value) {
  return value;
}
