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
  const label = getValue("withProjectLabel")
  if (getValue("withproject")) {
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
  if (getValue("withproject")) {
    createDocuments("output04Folder")
  } else {
    const label = getValue("withProjectLabel")
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

    // Create document and replace values
    const copy = createDocumentFromTemplate(template)

    // Output link to document
    // TODO: set URL 
    SpreadsheetApp.flush()
  })
}




/**
 * Creates a document from a template by substituting values with named ranges in Spreadsheet.
 * @param {Object} template - The template to create a document from.
 * @returns {Object} - The created document.
 */
function createDocumentFromTemplate(template) {

  // Get template values
  const destinationFolder = getDestinationFolder(template.folder)
  const filename = template.filename
  const templateId = template.templateId
  const exportToPDF = template.exportToPDF
  const copyComments = template.copyComments
  const templateType = template.templateType

  // Remove all matching files on destination folder to avoid duplicates
  Tools.deleteFile(filename, destinationFolder)
  const templateFile = DriveApp.getFileById(templateId)
  const mimeType = templateFile.getMimeType()
  const copy = templateFile.makeCopy(filename, destinationFolder)

  // Form search pattern
  const leftDelimiter = "<"
  const rightDelimiter = ">"
  const searchPattern = `${leftDelimiter}.*?${rightDelimiter}`

  // Copy comments and replies
  function copyCommentsAndReplies(copy, templateId) {
    var newDocId = copy.getId()
    var commentList = Drive.Comments.list(templateId, { 'maxResults': 100 })
    commentList.items.forEach(item => {
      //if (!item.status == "resolved") {
      var replies = item.replies
      delete item.replies
      var commentId = Drive.Comments.insert(item, newDocId).commentId
      replies.forEach(reply => Drive.Replies.insert(reply, newDocId, commentId))
      //}
    })
  }

  // Create doc or excel from template 

  // Documents
  if (mimeType == "application/vnd.google-apps.document") {

    const doc = DocumentApp.openById(copy.getId())

    // Replace signature images
    const signatureText = "<firmaIngeniera>"
    if (doc.getBody().findText(signatureText) != null) {
      const signature = DriveApp.getFileById(getValue("firmaIngeniera")).getBlob()
      replaceImage(doc, signatureText, signature, 300)
    }

    // Replace values in body, headers and footers
    const parent = doc.getBody().getParent()

    for (var i = 0; i < parent.getNumChildren(); i++) {
      try {
        // Get all values to be replaced in current child
        const child = parent.getChild(i)

        var range = child.findText(searchPattern)
        const valuesToBeReplaced = []
        while (range) {
          const matches = [...range.getElement().asText().getText().matchAll(searchPattern)].map(e => e[0])
          matches.forEach(match => {
            if (!valuesToBeReplaced.includes(match)) valuesToBeReplaced.push(match)
          })
          range = child.findText(searchPattern, range)
        }

        // Replace values
        valuesToBeReplaced.forEach(valueToBeReplaced => {
          const namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(valueToBeReplaced.split(leftDelimiter).pop().split(rightDelimiter)[0])
          if (namedRange != null) {
            const namedRangeValue = namedRange.getDisplayValue()
            child.replaceText(valueToBeReplaced, namedRangeValue)
          }
        })

      }
      catch (err) { }
    }

    // Copy comments and replies
    if (copyComments) copyCommentsAndReplies(copy, templateId)

    // Manage additional actions for templates with special tables
    if (templateId == "1Q7aRFNjqB_Kc9daRPDRhs2kqt7XuZMYmhGRQjLVHBY8") createPemAdditionalContents(doc)
    if (templateId == "1xttGTW5xY0mnyuCEU8gEQwQ926WH4vTG0mZS4CEKuJQ") createBillAdditionalContents(doc)
    if (templateId == "13ldY9Q8bK7ijZSauJYD2piVbyYfYKtTPjf7qdhWTE6k") createFinalStudyAdditionalContents(doc)
    if (templateId == "1k9lYTmxMsINC6U49w1NWOu0-3dGkYUBF5yrhKmkGb04") createInstallationGuideAdditionalContents(doc)
    if (templateId == "1SG2LSz9Hh-ds9R8RFUYhRjyx-KWhmjqyUzFea5kqIbI") createCELwithQuotaAdditionalContents(doc)
    if (templateId == "1BJOQIriXkyzu1gWUxJBv9yhwKQ9OdVZxgZJRoaxyaE8") createCELstudy(doc)
    if (templateId == "1Z99ZLph56eCyNmbsGeqXk9CmcIHGXgEYOspGgAxxs3M") createCELstudy(doc)

    doc.saveAndClose()

    // Create PDF version
    if (exportToPDF) {
      // Remove all matching pdf files on destination folder to avoid duplicates
      const pdfFilename = filename + ".pdf"
      Tools.deleteFile(pdfFilename, destinationFolder)

      var pdfVersion = DriveApp.createFile(doc.getAs('application/pdf'))
      pdfVersion.moveTo(destinationFolder)
      pdfVersion.setName(pdfFilename)
    }
  }

  // Spreadsheets
  else if (mimeType == "application/vnd.google-apps.spreadsheet") {
    const excel = SpreadsheetApp.openById(copy.getId())

    // Get patterns to be replaced
    const textFinder = excel.createTextFinder(searchPattern).useRegularExpression(true)
    const allMatches = textFinder.findAll().map(e => e.getValue())
    const replacementValues = []
    allMatches.forEach(row => {
      replacementValues.push(...[...row.toString().matchAll(searchPattern)].map(e => e[0]))
    })

    // Replace variables in template
    replacementValues.forEach(value => {
      const textFinder = excel.createTextFinder(value)
      const namedRangeName = value.split(leftDelimiter).pop().split(rightDelimiter)[0]
      const namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(namedRangeName)
      if (namedRange != null) {
        textFinder.replaceAllWith(getValue(namedRangeName))
      }
    })

    // Copy comments and replies
    copyCommentsAndReplies(copy, templateId)
  }

  return copy

}