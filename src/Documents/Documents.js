/**
 * Creates the final study documents.
 */
function createFinalStudy() {
  createDocuments("outputStudy")
}

/**
 * Creates the documentation for the 00 folder.
 */
function create00FolderDocumentation() {
  createDocuments("output00Folder")
}

/**
 * Creates the documentation for the 01 folder.
 */
function create01FolderDocumentation() {
  createDocuments("output01Folder")
}

/**
 * Creates the memory or project and guide documents.
 */
function createMemoryOrProjectAndGuide() {
  const label = get("withProjectLabel")
  if (get("withproject")) {
    Tools.showMessage("Generación de documentación", `La casilla "${label}" de la pestaña "Documentación" está marcada. Se generará proyecto de instalación.`)
    createDocuments("outputProject")
  } else {
    Tools.showMessage("Generación de documentación", `La casilla "${label}" de la pestaña "Documentación" no está marcada. Se generará memoria técnica de instalación.`)
    createDocuments("outputMemory")    
  }

  createDocuments("outputGuide")
}

/**
 * Creates the bill document.
 */
function createBill() {
  createDocuments("outputBill")
}

/**
 * Creates the documentation for the 02 and 03 folders.
 */
function create02And03FolderDocumentation() {
  createDocuments("output02Folder")
  createDocuments("output03Folder")
}

/**
 * Creates the documentation for the 04 folder.
 */
function create04FolderDocumentation() {
  if (get("withproject")) {
    createDocuments("output04Folder")
  } else {
    const label = get("withProjectLabel")
    Tools.showMessage("Generación de documentación", SpreadsheetApp.getUi().alert(`La casilla "${label}" de la pestaña "Documentación" no está marcada. No se generará ningún documento.`))
  }
}

/**
 * Creates the documentation for the 05 folder.
 */
function create05FolderDocumentation() {
  createDocuments("output05Folder")
}

/**
 * Creates all documents for individual installations.
 */
function createAllDocuments() {
  createFinalStudy()
  create00FolderDocumentation()
  create01FolderDocumentation()
  createMemoryOrProjectAndGuide()
  createBill()
  create02And03FolderDocumentation()
  create04FolderDocumentation()
  create05FolderDocumentation()
}


/**
 * Creates the documentation for shared installations
 */
function createSharedStudy() {
  createDocuments("outputSharedStudy")
}

/**
 * Creates the documentation for custom shared installations
 */
function createCustomSharedStudy() {
  createDocuments("outputSharedCustomStudy")
}

/**
 * Creates the savings documentation for shared installations
 */
function createSavingsSharedStudy() {
  createDocuments("outputSharedSavingsStudy")
}


/**
 * Creates a test document.
 */
function createTestDocument() {
  createDocuments("test")
}


/**
 * Creates documents from templates.
 * @param {string} outputNamedRange - Name of the output range.
 */
function createDocuments(outputNamedRange) {

  const templates = createTemplatesArray(outputNamedRange)

  // Clear output range
  const outputRange = getRangeByName(outputNamedRange)
  clearRange(outputNamedRange)

  // Replace values in all templates
  templates.forEach((template, templateIndex) => {

    // Manage additional actions for templates with special type
    const templateHandlers = {
      "Pem": createPemAdditionalContents,
      "Bill": createBillAdditionalContents,
      "FinalStudy": createFinalStudyAdditionalContents,
      "InstallationGuide": createInstallationGuideAdditionalContents,
      "CelSavings": createCELwithQuotaAdditionalContents,
      "CelStudy": createCELstudy,
      "CelStudy": createCELstudy
    };

    const customHandlerFn = templateHandlers[templates.templateType] || null

    // Create document and replace values
    const destinationFolder = getDestinationFolder(template.folder)
    const delimiters = { left: '<', right: '>' }
    const copy = createDocumentFromTemplate(template, destinationFolder, delimiters, customHandlerFn)

    // Output link to document
    const nextNamedRangeName = "next"
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Documentación")
    SpreadsheetApp.getActiveSpreadsheet().setNamedRange(nextNamedRangeName, sheet.getRange(outputRange.getRow() + templateIndex, outputRange.getColumn()))
    setURL(nextNamedRangeName, copy.getUrl(), template.filename
    )
    SpreadsheetApp.flush()
  })
}

