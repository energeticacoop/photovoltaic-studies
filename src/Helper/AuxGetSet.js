/**
 * Retrieves and validates a range's value(s) from the active spreadsheet.
 *
 * @param {string} rangeName - The name of the named range.
 * @returns {*} The validated value(s) from the range.
 * @throws {Error} If the range doesn't exist, the schema is missing, or validation fails.
 */
function get(rangeName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const range = sheet.getRangeByName(rangeName);

  if (!range) {
    throw new Error(`⚠️ El rango con nombre "${rangeName}" no existe.`);
  }

  const validator = RangeSchemas[rangeName];

  if (!validator) {
    throw new Error(`⚠️ No se ha definido un esquema de validación para el rango "${rangeName}".`);
  }

  try {
    validator(range);  // Perform the validation
  } catch (error) {
    throw new Error(`❌ Error en "${rangeName}": ${error.message}`);
  }

  return range.getValue()
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
    values = [[values]]  // Wrap single value in an array to set it as a single cell
  }
  
  // If it's an array but not a 2D array, it’s a single column (1D array)
  if (Array.isArray(values) && !Array.isArray(values[0])) {
    values = values.map(value => [value])  // Convert 1D array to 2D array
  }

  // Check if the shape of values matches the shape of the range
  const numRows = range.getNumRows()
  const numCols = range.getNumColumns()
  const valuesNumRows = values.length
  const valuesNumCols = values[0].length

  if (valuesNumRows !== numRows || valuesNumCols !== numCols) {
    throw new Error(`Error: Mismatched dimensions. The range "${name}" expects a ${numRows}x${numCols} array, but the provided data is ${valuesNumRows}x${valuesNumCols}.`)
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
 * Clears the content of a named range in a Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range to clear.
 */
function clearRange(rangeName) {
  SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName).clearContent()
}

/**
 * Gets a range by its name from the active Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range to retrieve.
 * @returns {Range} The range with the specified name.
 */
function getRangeByName(rangeName) {
  return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName)
}

/**
 * Creates an array of template objects from the named range "templates"
 * and filters them based on the provided outputNamedRange.
 *
 * @param {string} outputNamedRange - The value to filter templates by
 * @returns {Array<Object>} Filtered array of template objects matching the outputNamedRange
 */
function createTemplatesArray(outputNamedRange) {
  // Get the named range "templates" that contains the template data
  const templatesData = get("templates")

  // Get the headers from the first row (index 0) to use as object keys
  const headers = templatesData[0]
  
  // Initialize an empty array to hold the template objects
  const templatesArray = []

  // Loop through each row of template data (starting from the second row)
  for (let i = 1; i < templatesData.length; i++) {
    const row = templatesData[i]
    
    // Create an object for each template row
    let templateObj = {}
    
    // Loop through each header to assign values from the row to the object
    for (let j = 0; j < headers.length; j++) {
      templateObj[headers[j]] = row[j]
    }
    
    // Add the template object to the array
    templatesArray.push(templateObj)
  }
  
  // Filter the templates based on the outputNamedRange
  const filteredTemplates = templatesArray.filter(template => template.outputNamedRange === outputNamedRange)

  // Return the filtered array of template objects
  return filteredTemplates
}