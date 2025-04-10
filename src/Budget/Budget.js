/**
 * Populates the budget sheet with data from another sheet based on the chosen installation size.
 */
function populateBudget() {

  // Get chosen installation size and default budget
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const installationType = ss.getRangeByName("installationSize").getValue()
  const sourceSheet = ss.getSheetByName(installationType)
  const destinationSheet = ss.getSheetByName('Presupuesto')

  // Show message
  Tools.showMessage(
    "ℹ️ Generación de presupuesto",
    `Generando presupuesto tipo de instalación ${installationType}...`, 3
  )

  // Determine the range of the source sheet
  var sourceRange = sourceSheet.getDataRange()
  
  // Fetch values and formulas from the source range
  var data = sourceRange.getValues()
  var formulas = sourceRange.getFormulas()
  
  // Prepare to paste data and formulas to the destination sheet
  var destinationRange = destinationSheet.getRange(1, 1, data.length, data[0].length)
  
  // Clearing the destination range before pasting new data and formulas
  destinationRange.clearContent()
  
  // Set values in the destination sheet
  destinationRange.setValues(data)
  
  // Loop through the formulas array and apply them to the corresponding cells
  for (var row = 0; row < formulas.length; row++) {
    for (var col = 0; col < formulas[row].length; col++) {
      if (formulas[row][col]) { // Checks if there is a formula in the cell
        destinationSheet.getRange(row + 1, col + 1).setFormula(formulas[row][col])
      }
    }
  }
}


/**
 * Retrieves the budget data from the "Presupuesto" sheet.
 * @param {boolean} [getOptionalElements=false] - Whether to include optional elements in the budget.
 * @param {boolean} [getGuideTable=false] - Whether to include the guide table elements in the budget.
 * @returns {Array<Object>} The budget data.
 */
function getBudget(getOptionalElements = false, getGuideTable = false) {

  function getItemType(row) {
    if (row["Código título"] != "") return "title"
    if (row["Código ítem"] != "") return "item"
    if (row["Código subítem"] != "") return "subitem"
  }

  // Get complete budget table and headers
  var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Presupuesto").getDataRange().getDisplayValues()
  const headers = data[0].slice(0, data[0].indexOf("Potencia pico (Wp)"))

  // Initialize budget and last empty element
  const budget = []
  var lastEmptyElement = ""

  for (var i = 2; i < data.length; i++) {

    // Construct row object with header names
    const row = Object.assign.apply({}, headers.map((v, j) => ({ [v]: data[i][j] })))

    // Get codes for budget items
    row["Código título"] = row["Código título"].toString().trim() 
    row["Código ítem"] = row["Código ítem"].toString().trim() 
    row["Código subítem"] = row["Código subítem"].toString().trim()
    const code = row["Código título"] + row["Código ítem"] + row["Código subítem"]
    row.code = code

    if (code.startsWith(lastEmptyElement + ".")) continue
    if (getGuideTable && !code.startsWith("1")) continue
    if (code == "PT" || code == "IVA" || code == "PTIVA") continue

    const quantity = row.Cantidad
    const itemType = getItemType(row)
    row.type = itemType

    // If item, get item description
    if (row.type == "item"){
      const description = data[i + 1][data[0].indexOf("Descripción ítem")]
      row["Descripción"] = description
    } 

    const quantityIsZero = (quantity == 0 || quantity == "" || quantity == "0")
    if ((itemType == "title" || itemType == "item") && quantityIsZero) lastEmptyElement = code

    // If non empty, add row to budget
    if (code != "" && !quantityIsZero && (getOptionalElements ? code.includes("O") : !code.includes("O"))) {

      // Insert empty rows after chapters (except SUMINISTRO and OPCIONALES)
      if (!getGuideTable && itemType == "title" && code != "1" && code != "O") budget.push({ "type": "empty" })
      if (getGuideTable && itemType == "item" && code != "1.1" && !quantityIsZero) budget.push({ "type": "empty" })
      budget.push(row)
    }
  }
  budget.push({ "type": "empty" })
  return budget
}
