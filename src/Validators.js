/**
 * Centralized schema for range validations.
 * Each key matches a named range and defines how its value should be validated.
 */
const RangeSchemas = {
  coordinates: {
    shape: "cell",
    validator: isCoordinatePair,
    error: "Las coordenadas deben estar en formato 'lat,lng'" // Static error message
  },
  tagsColumn: {
    shape: "column",
    validator: (values) => values.every(isNonEmptyString),
    error: "Cada celda de la columna debe tener texto"
  },
  matrixData: {
    shape: "matrix",
    validator: (values) => values.every(row => row.every(isNonEmptyString)),
    error: "Cada celda de la matriz debe tener texto"
  }
}



function isNonEmptyString(val) {
  return typeof val === "string" && val.trim().length > 0
}

function isNumber(val) {
  return typeof val === "number" && !isNaN(val)
}

function isCoordinatePair(val) {
  return typeof val === "string" &&
    /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(val)
}
