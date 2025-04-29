/**
 * Retrieves and validates a range's value(s) from the active spreadsheet.
 *
 * Supports single cell, single-column, or full matrix based on schema.
 *
 * @param {string} rangeName - The name of the named range.
 * @returns {*} The validated value(s) from the range.
 * @throws {Error} If the range doesn't exist, the schema is missing, or validation fails.
 */
function get(rangeName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
  const range = sheet.getRangeByName(rangeName)

  if (!range) {
    throw new Error(`⚠️ El rango con nombre "${rangeName}" no existe.`)
  }

  const validator = RangeSchemas[rangeName]
  const rawValues = range.getValues()

  if (!validator) {
    return rawValues
  }

  try {
    const result = validator(rawValues)
    return result
  } catch (e) {
    throw new Error(`❌ Error al validar el rango "${rangeName}": ${e.message}`)
  }
}

/**
 * Sets values in a named range in Google Sheets.
 * It handles single values, multiple values (matrix), and single column values.
 * It also performs error checking to ensure the shape of the data matches the shape of the range.
 *
 * @param {string} name - The name of the range to set the values in.
 * @param {any|Array<any>|Array<Array<any>>} values - The value(s) to set:
 *    - A single value for a single cell.
 *    - An array of values for a column (single array of values).
 *    - A matrix (2D array) for multiple cells.
 */
function set(name, values) {
  const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name)

  // If the values are a single value, wrap it in an array to treat it as a single cell
  if (!Array.isArray(values)) {
    values = [[values]] // Wrap single value in an array to set it as a single cell
  }

  // If it's an array but not a 2D array, it’s a single column (1D array)
  if (Array.isArray(values) && !Array.isArray(values[0])) {
    values = values.map((value) => [value]) // Convert 1D array to 2D array
  }

  // Check if the shape of values matches the shape of the range
  const numRows = range.getNumRows()
  const numCols = range.getNumColumns()
  const valuesNumRows = values.length
  const valuesNumCols = values[0].length

  if (valuesNumRows !== numRows || valuesNumCols !== numCols) {
    throw new Error(
      `Error: Mismatched dimensions. The range "${name}" expects a ${numRows}x${numCols} array, but the provided data is ${valuesNumRows}x${valuesNumCols}.`
    )
  }

  // Set the values in the range
  range.setValues(values)
}

/**
 * Applies a URL link to a cell using either the existing text content or a provided one.
 *
 * @param {string} rangeName - The named range identifying the cell to update.
 * @param {string} url - The URL to link.
 * @param {string} [text] - Optional. If provided, will be used as the link's display text.
 */
function setURL(rangeName, url, text) {
  const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName)
  const displayText = text !== undefined ? text : range.getDisplayValue()

  const richValue = SpreadsheetApp.newRichTextValue()
    .setText(displayText)
    .setLinkUrl(url)
    .build()

  range.setRichTextValue(richValue)
}

/**
 * Gets a range by its name from the active Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range to retrieve.
 * @returns {Range} The range with the specified name.
 */
function getRangeByName(rangeName) {
  return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName)
}
