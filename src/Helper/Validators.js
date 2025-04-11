/**
 * Centralized schema for range validations.
 * Each key matches a named range and defines how its value should be validated.
 */
const RangeSchemas = {
  coordinates: Validators.isCoordinatePair,
  tmyFileName: Validators.isNonEmptyString,
  selectedSelfConsumers: Validators.isBooleanMatrix,
  selfConsumersData: Validators.alwaysTrue,
  "perfilREE2.0": Validators.isNumberMatrix,
  "perfilREE3.0": Validators.isNumberMatrix,
  normalizedDates: Validators.isDateMatrix,
  recurringDaily: Validators.isNumberMatrix,
};



class Validators {
  @cell
  static isCoordinatePair(value) {
    if (
      typeof value !== "string" ||
      !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(value)
    ) {
      throw new Error("Las coordenadas deben estar en formato 'lat,lng'.");
    }
    return true;
  }

  @cell
  static isNonEmptyString(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Se esperaba una cadena no vacía.");
    }
    return true;
  }

  @matrix
  static isBooleanMatrix(matrix) {
    if (!matrix.every(row => row.every(val => typeof val === "boolean"))) {
      throw new Error("Todos los valores deben ser booleanos.");
    }
    return true;
  }

  @matrix
  static isNumberMatrix(matrix) {
    if (
      !matrix.every(row =>
        row.every(val => typeof val === "number" || val === "" || val === null)
      )
    ) {
      throw new Error("Todos los valores deben ser números o celdas vacías.");
    }
    return true;
  }

  @matrix
  static isDateMatrix(matrix) {
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
    return true;
  }

  static alwaysTrue(_) {
    return true;
  }
}




function matrix(target, propertyKey, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(values) {
    if (!Array.isArray(values) || !values.every(Array.isArray)) {
      throw new Error("Se esperaba una matriz (2D array).");
    }
    return original.call(this, values);
  };
}

function cell(target, propertyKey, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(value) {
    if (Array.isArray(value)) {
      throw new Error("Se esperaba una celda (valor único).");
    }
    return original.call(this, value);
  };
}

function column(target, propertyKey, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(values) {
    if (!Array.isArray(values) || !values.every(v => Array.isArray(v) && v.length === 1)) {
      throw new Error("Se esperaba una columna (array de arrays de un solo elemento).");
    }
    return original.call(this, values.map(v => v[0]));
  };
}
