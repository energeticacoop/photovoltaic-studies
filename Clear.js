/**
 * Clears the values of all cells with a specified green background 
 * (#b6d7a8) while preserving any formulas present in those cells. 
 * 
 * This function processes each cell in the first 100 rows of the 
 * active sheet using a declarative style. If a cell has a green 
 * background and does not contain a formula, its value is cleared. 
 * If a cell has a green background but contains a formula, 
 * the formula is preserved. Cells that do not have the specified 
 * background color remain unaffected. 
 * 
 * Additionally, if the sheet is named "Producción", it will also
 * clear the named range "productionSAM".
 * 
 * Usage: Call this function to clean up data while keeping formulas 
 * intact for cells with a specific background color.
 */
function clearGreenCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const sheetName = sheet.getName() // Get the name of the current sheet
  const maxRows = Math.min(100, sheet.getMaxRows()) // Get the lesser of 100 or the total number of rows
  const range = sheet.getRange(1, 1, maxRows, sheet.getMaxColumns()) // Get the range for the first 100 rows or fewer
  const values = range.getValues() // Get the values of the specified range
  const formulas = range.getFormulas() // Get the formulas of the specified range
  const backgrounds = range.getBackgrounds() // Get the background colors of the specified range

  const greenHex = "#b6d7a8" // Hex code for the specified green background

  // Use nested map functions to create a new values array
  const newValues = values.map((row, i) => 
    row.map((cellValue, j) => 
      (backgrounds[i][j] === greenHex) 
      ? (formulas[i][j] || "") // Keep formula if it exists, otherwise clear value
      : (formulas[i][j] || cellValue) // Keep current value if not green or keep formula if it exists
    )
  )

  // Set the updated values back into the sheet
  range.setValues(newValues)

  // If the sheet is named "Producción", clear the named range "productionSAM"
  if (sheetName === "Producción") {
    const productionRange = getRangeByName("productionSAM") // Get the named range
    if (productionRange) {
      productionRange.clearContent() // Clear the content of the named range
    }
  }
}




function clearLoadCurves() {
  const selectedSelfConsumers = getValues("selectedSelfConsumers")[0]
  selectedSelfConsumers.forEach((isSelected, index) => {
    if (isSelected) {

      const selfConsumerIndex = index + 1
      const selfConsumer = new SelfConsumer(selfConsumerIndex)

      Logger.log("Processing load curve for self-consumer #" + selfConsumerIndex)
      const headings = ["cchConventional", "cchRecurring", "cchASHP", "cchSAVE"]
      headings.forEach(heading => {
        selfConsumer.clearLoadCurve(heading)
      })


    }
  })

}


/**
 * Removes all broken named ranges (those with #REF errors) from the active spreadsheet.
 */
function removeBrokenNamedRanges(simulate=true) {
  // Get the active spreadsheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  
  // Get all named ranges in the spreadsheet
  const namedRanges = spreadsheet.getNamedRanges()
  
  // Loop through each named range
  namedRanges.forEach(namedRange => {
    try {
      // Attempt to get the range of the named range
      const name = namedRange.getName()
      const attempt = getRangeByName(name)
      const notation = attempt.getA1Notation()
    } catch (e) {
      // If an error occurs, it's likely a #REF issue
      console.log(`Removing broken named range: ${namedRange.getName()}`)
      
      // Remove the broken named range
      if (!simulate){
        namedRange.remove()
      }
    }
  })
}



/**
 * Identifies and logs all named ranges that are not used in any formula of the spreadsheet.
 */
function findUnusedNamedRanges() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const namedRanges = spreadsheet.getNamedRanges()
  const allSheets = spreadsheet.getSheets()
  
  // Gather all formulas in the spreadsheet
  let allFormulas = ''
  allSheets.forEach(sheet => {
    const range = sheet.getDataRange()
    const formulas = range.getFormulas().flat() // Get all formulas in the sheet and flatten into a single array
    allFormulas += formulas.join(' ')
  })
  
  // Check each named range against the collected formulas
  const unusedNamedRanges = namedRanges.filter(namedRange => {
    const name = namedRange.getName()
    return !allFormulas.includes(name) // Check if the named range is used in any formula
  })
  
  // Log unused named ranges
  if (unusedNamedRanges.length > 0) {
    console.log('Unused Named Ranges:')
    unusedNamedRanges.forEach(namedRange => console.log(namedRange.getName()))
  } else {
    console.log('No unused named ranges found.')
  }
}

