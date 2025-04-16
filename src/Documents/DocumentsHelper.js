/**
 * Creates a document or spreadsheet from a template by substituting named ranges in a spreadsheet.
 * Supports additional content handlers and optional PDF export.
 *
 * @param {Object} templateProps - Template configuration.
 * @param {string} templateProps.templateId - File ID of the template.
 * @param {string} templateProps.filename - Output file name.
 * @param {boolean} templateProps.exportToPDF - Whether to generate a PDF copy.
 * @param {boolean} templateProps.copyComments - Whether to copy comments and replies from the original template.
 * @param {GoogleAppsScript.Drive.Folder} destinationFolder - Folder object to place the output file in.
 * @param {Object} [delimiters={left:'<', right:'>'}] - Delimiters used for identifying substitution tokens.
 * @param {Function} [customHandlerFunction=null] - Optional handler for special template-specific processing.
 * @returns {GoogleAppsScript.Drive.File} The created file.
 */
function createDocumentFromTemplate(
  templateProps,
  destinationFolder,
  delimiters = { left: "<", right: ">" },
  customHandlerFunction = null
) {
  // MIME type constants for clarity and maintainability.
  const MIME_TYPE_GOOGLE_DOC = "application/vnd.google-apps.document"
  const MIME_TYPE_GOOGLE_SHEET = "application/vnd.google-apps.spreadsheet"
  const MIME_TYPE_PDF = "application/pdf"

  const SIGNATURE_NAMED_RANGE = "firmaIngeniera"
  const signatureDelimiters = { left: "{{", right: "}}" }

  const { filename, templateId, exportToPDF, copyComments } = templateProps

  Tools.deleteFile(filename, destinationFolder)

  const templateFile = DriveApp.getFileById(templateId)
  const mimeType = templateFile.getMimeType()
  const copy = templateFile.makeCopy(filename, destinationFolder)

  const searchPattern = `${delimiters.left}.*?${delimiters.right}`
  const signaturePattern = `${signatureDelimiters.left}${signatureNamedRange}${signatureDelimiters.right}`

  if (mimeType === MIME_TYPE_GOOGLE_DOC) {
    const doc = DocumentApp.openById(copy.getId())

    replaceSignatureIfPresent(doc, signaturePattern, SIGNATURE_NAMED_RANGE)
    replaceTextInDoc(doc, searchPattern, delimiters)

    if (copyComments) copyCommentsAndReplies(copy, templateId)
    if (typeof customHandlerFunction === "function") customHandlerFunction(doc)

    doc.saveAndClose()

    if (exportToPDF) {
      const pdfFilename = filename + ".pdf"
      Tools.deleteFile(pdfFilename, destinationFolder)
      const pdf = DriveApp.createFile(doc.getAs(MIME_TYPE_PDF))
      pdf.moveTo(destinationFolder)
      pdf.setName(pdfFilename)
    }
  } else if (mimeType === MIME_TYPE_GOOGLE_SHEET) {
    const sheet = SpreadsheetApp.openById(copy.getId())
    replaceTextInSheet(sheet, searchPattern, delimiters)

    if (copyComments) copyCommentsAndReplies(copy, templateId)
  }

  return copy
}

/**
 * Replaces a placeholder in the document with an image from a named range.
 *
 * @param {GoogleAppsScript.Document.Document} doc - The document object.
 * @param {string} pattern - The exact placeholder text to search for in the document (e.g., "{{firmaIngeniera}}").
 * @param {string} signatureNamedRange - The name of the named range containing the signature file ID.
 */
function replaceSignatureIfPresent(doc, pattern, signatureNamedRange) {
  const SIGNATURE_IMAGE_WIDTH_PX = 300
  const body = doc.getBody()

  if (body.findText(pattern)) {
    const signatureBlob = DriveApp.getFileById(
      get(signatureNamedRange)
    ).getBlob()
    replaceImage(doc, pattern, signatureBlob, SIGNATURE_IMAGE_WIDTH_PX)
  }
}

/**
 * Replaces all token placeholders in a document using named ranges.
 * @param {GoogleAppsScript.Document.Document} doc - The document object.
 * @param {string} pattern - Regex pattern to identify tokens.
 * @param {Object} delimiters - Left and right delimiters.
 */
function replaceTextInDoc(doc, pattern, delimiters) {
  const parent = doc.getBody().getParent()

  for (let i = 0; i < parent.getNumChildren(); i++) {
    const child = parent.getChild(i)
    const valuesToReplace = new Set()
    let range = child.findText(pattern)

    while (range) {
      const matches = range.getElement().asText().getText().matchAll(pattern)
      for (const match of matches) {
        valuesToReplace.add(match[0])
      }
      range = child.findText(pattern, range)
    }

    for (const token of valuesToReplace) {
      const name = token.slice(delimiters.left.length, -delimiters.right.length)
      const namedRange =
        SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name)
      if (namedRange) {
        child.replaceText(token, namedRange.getDisplayValue())
      }
    }
  }
}

/**
 * Replaces all token placeholders in a spreadsheet using named ranges.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet - The spreadsheet object.
 * @param {string} pattern - Regex pattern to identify tokens.
 * @param {Object} delimiters - Left and right delimiters.
 */
function replaceTextInSheet(sheet, pattern, delimiters) {
  const matches = sheet
    .createTextFinder(pattern)
    .useRegularExpression(true)
    .findAll()
  const tokens = new Set()

  matches.forEach((cell) => {
    const found = cell.getValue().matchAll(pattern)
    for (const match of found) {
      tokens.add(match[0])
    }
  })

  for (const token of tokens) {
    const name = token.slice(delimiters.left.length, -delimiters.right.length)
    const namedRange =
      SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name)
    if (namedRange) {
      sheet.createTextFinder(token).replaceAllWith(get(name))
    }
  }
}

/**
 * Copies all comments and their replies from the original file to the copied file.
 * @param {GoogleAppsScript.Drive.File} copy - The newly created file.
 * @param {string} templateId - ID of the source template.
 */
function copyCommentsAndReplies(copy, templateId) {
  const newDocId = copy.getId()
  const comments = Drive.Comments.list(templateId, { maxResults: 100 })

  comments.items.forEach((item) => {
    const replies = item.replies || []
    delete item.replies

    const inserted = Drive.Comments.insert(item, newDocId)
    replies.forEach((reply) =>
      Drive.Replies.insert(reply, newDocId, inserted.commentId)
    )
  })
}
