/**
 * Sets a URL link with text in a specific range in a Google Sheets spreadsheet.
 * @param {Range} range - The range to set the URL link with text.
 * @param {string} url - The URL link to set.
 * @param {string} text - The text to display for the URL link.
 */
function setURL(range, url, text) {
  var richValue = SpreadsheetApp.newRichTextValue()
    .setText(text)
    .setLinkUrl(url)
    .build()
  range
    .setRichTextValue(richValue)
}


/**
 * Sets URL links with texts in a specific column range in a Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range where the URLs will be set.
 * @param {Array<string>} urls - An array of URL links to set.
 * @param {Array<string>} texts - An array of texts to display for the URL links.
 */
function setColumnURLS(rangeName, urls, texts) {
  const range = getRangeByName(rangeName)
  range.getValues().forEach(function (row, i) {
    var richValue = SpreadsheetApp.newRichTextValue()
      .setText(texts[i])
      .setLinkUrl(urls[i])
      .build()
    range.getCell(i + 1, 1).setRichTextValue(richValue)
  })
}

/**
 * Sets a single value in a named range in a Google Sheets spreadsheet.
 * @param {string} name - The name of the range where the value will be set.
 * @param {any} value - The value to set.
 */
function setValue(name, value) {
  getRangeByName(name).setValue(value)
}

/**
 * Sets multiple values in a named range in a Google Sheets spreadsheet.
 * @param {string} name - The name of the range where the values will be set.
 * @param {Array<Array<any>>} values - The values to set.
 */
function setValues(name, values) {
  getRangeByName(name).setValues(values)
}

/**
 * Sets values in a single column of a named range in a Google Sheets spreadsheet.
 * @param {string} name - The name of the range where the values will be set.
 * @param {Array<any>} values - The values to set in the column.
 */
function setColumn(name, values) {
  setValues(
    name,
    values.map((element) => [element])
  )
}

/**
 * Gets a single value from a named range in a Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range to get the value from.
 * @returns {any} The value from the named range.
 */
function getValue(rangeName) {
  return getRangeByName(rangeName).getValue()
}

/**
 * Gets multiple values from a named range in a Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range to get the values from.
 * @returns {Array<Array<any>>} The values from the named range.
 */
function getValues(rangeName) {
  return getRangeByName(rangeName).getValues()
}

/**
 * Gets the values from a single column of a named range in a Google Sheets spreadsheet.
 * @param {string} rangeName - The name of the range to get the values from.
 * @returns {Array<any>} The values from the named range column.
 */
function getColumn(rangeName) {
  return getValues(rangeName).map((element) => element[0])
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
  const templatesData = getValues("templates")

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