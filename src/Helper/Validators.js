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
};



/**
 * Shape validators (decorator-style)
 */

function withCellShape(validatorFn) {
  return function(value) {
    if (Array.isArray(value)) {
      // Extra protection: flattening accidental getValues() misuse
      if (value.length === 1 && Array.isArray(value[0]) && value[0].length === 1) {
        value = value[0][0]; // Extract the raw value
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
    throw new Error("Se esperaba una cadena no vacía.");
  }
  return value
}

function isBooleanMatrix(matrix) {
  if (!matrix.every(row => row.every(val => typeof val === "boolean"))) {
    throw new Error("Todos los valores deben ser booleanos.");
  }
  return matrix;
}

function isNumberMatrix(matrix) {
  if (!Array.isArray(matrix)){
    throw new Error("El rango debe ser un array.")
  }

  if (!matrix.every(row => 
    Array.isArray(row) && 
    row.every(val => typeof val === "number" || val === "" || val === null)
  )){
      throw new Error("Todos los valores deben ser números.");
  }
  return matrix
}

function isNumberColumn(column) {
  if (!Array.isArray(column)){
    throw new Error("El rango debe ser un array.")
  }

  if (!column.every(val => typeof val === "number" || val === "" || val === null)){
      throw new Error("Todos los valores deben ser números.");
  }
  return column
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
